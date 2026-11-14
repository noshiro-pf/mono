import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as util from 'node:util';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { plural } from '../lib/plural.mjs';
import { spawnPnpm } from '../lib/step-runner.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import {
  readMatrixInclude,
  readRootManifest,
  resolveScriptInvocations,
} from './check-ci-commands.mjs';
import { runJob } from './ci-job.mjs';
import { ignoredBy, readGateList } from './workflow-steps.mjs';

/**
 * Runs, one after another, the entries of the matrices of `code-check.yml` and
 * `style-check.yml`, each as CI's job runs it (`z:ci-job`: its build, the
 * entry, and a failure for a step that changed the tree). The entries are read
 * from the workflows, so what this runs cannot fall behind them (#3213).
 *
 * A human aid rather than a gate: `pnpm run check-changed` is what a change is
 * checked with (`CLAUDE.md`, "Commands"). What this leaves out:
 *
 * - An entry that needs Chromium (`browser: true`) or Java (`java: true`),
 *   which `pnpm install` does not set up, except the parts of a bundle that
 *   need neither (`PART_NEEDS` names the rest); `--all` runs them too, once
 *   `pnpm exec playwright install --only-shell chromium` (the full build,
 *   `pnpm exec playwright install chromium`, for `ws:check:e2e`, whose suites
 *   may load an extension) and a Java 21 are in place.
 * - The other check workflows: `strict-lib-gen.yml` (its generators rewrite
 *   thousands of files), `node-version-compatibility.yml` (other Node
 *   versions), `verify-published-packages.yml` (what the registry serves) and
 *   `synstate-benchmark.yml`.
 * - A build an earlier entry already ran (`ws:build` covers `ws:build:deps`)
 *   is not run again while the tree stays as it left it, and one that failed
 *   is not run again either, nor one that covers it (`ws:build` after a failed
 *   `ws:build:deps`): the entries naming either are reported as not run.
 *   CI's jobs start from a clean tree each; here an entry that rewrote the
 *   tree is reported, the next one runs on what it left, and, if it wrote a
 *   file a build reads, the builds are run afresh from then on, so that no
 *   entry reads a `dist/` older than the sources it was built from.
 * - `fix:codemod:affected` runs in full, as on a manual CI run, because
 *   `CODEMOD_DIFF_BASE` is not set.
 * - Every step runs with `CI=true`, as in CI: Playwright then serves the
 *   prebuilt preview rather than reusing a dev server already running, and
 *   retries a failed test.
 *
 * ```sh
 * pnpm run check-all [--all] [--dry-run]
 * ```
 */
const checkAll = async (): Promise<number> => {
  const { values } = util.parseArgs({
    options: {
      all: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
    },
    strict: true,
  });

  const matrices = await Promise.all(
    MATRIX_WORKFLOWS.map(async (workflow) => ({
      workflow,
      entries: readMatrixInclude(
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixed path in this repository.
        await fs.readFile(path.join(projectRootPath, workflow), 'utf8'),
      ),
    })),
  );

  const unread = matrices.find(({ entries: read }) => Result.isErr(read));

  if (unread !== undefined && Result.isErr(unread.entries)) {
    console.error(`${unread.workflow}: ${unread.entries.value}`);

    return 2;
  }

  const entries = matrices.flatMap(({ entries: read }) =>
    Result.isOk(read) ? read.value : [],
  );

  const rootManifest = await readRootManifest();

  if (Result.isErr(rootManifest)) {
    console.error(rootManifest.value);

    return 2;
  }

  const selected = selectEntries(entries, {
    all: values.all,
    scripts: rootManifest.value.scripts,
    needs: PART_NEEDS,
  });

  if (values['dry-run']) {
    console.info(
      [
        ...selected.run.map(
          ({ command, build }) =>
            `${command}${build === undefined ? '' : ` (after ${build})`}`,
        ),
        ...selected.skipped.map(
          (entry) => `skipped: ${describeSkipped(entry)}`,
        ),
      ].join('\n'),
    );

    return 0;
  }

  // Read here rather than before the dry run, which never reads it; the list
  // itself is held valid by the `check:root` guards that read it.
  const codeGate = readGateList('code', projectRootPath);

  if (!codeGate.ok) {
    console.error(codeGate.message);

    return 2;
  }

  const unreadByBuilds = ignoredBy(codeGate.value);

  console.info('Installing dependencies...');

  if ((await spawnPnpm({ args: ['install'], cwd: '.', env: {} })) !== 0) {
    console.error('❌ pnpm install failed.');

    return 1;
  }

  const mut_state: { builds: BuildMemory } = { builds: NO_BUILDS };

  const mut_failures: string[] = [];

  const mut_ran: Run[] = [];

  const mut_notRun: Run[] = [];

  for (const [index, run] of selected.run.entries()) {
    const { command, build } = run;

    console.info(`\n##### ${index + 1}/${selected.run.length} ${command}`);

    const plan = planBuild(mut_state.builds, build);

    if (plan.kind === 'failed') {
      const message = notRunMessage({
        command,
        build: plan.build,
        failed: plan.failed,
        where: 'above',
      });

      // Under the entry's header now, and with the failures at the end.
      console.info(message);

      mut_failures.push(message);

      mut_notRun.push(run);

      continue;
    }

    const needed = plan.kind === 'run' ? plan.build : undefined;

    const outcome = await runJob({
      command,
      build: needed,
      requireCleanStart: false,
    });

    mut_state.builds = rememberBuild(mut_state.builds, {
      build: needed,
      failed: outcome.buildFailed,
      wrote: outcome.wrote,
      readByBuilds: (file) => !unreadByBuilds(file),
    });

    mut_failures.push(...outcome.failures);

    // Its own build failing leaves the command not run, as a later entry's is.
    if (needed !== undefined && outcome.buildFailed) {
      const message = notRunMessage({ command, build: needed, where: 'here' });

      console.info(message);

      mut_failures.push(message);

      mut_notRun.push(run);
    } else {
      mut_ran.push(run);
    }
  }

  console.info(
    [
      '',
      summarizeRun({
        entries,
        ran: mut_ran,
        notRun: mut_notRun,
        skipped: selected.skipped,
      }),
      ...(Arr.isNonEmpty(selected.skipped)
        ? Arr.toUnshifted('Skipped:')(
            selected.skipped.map((entry) => `  - ${describeSkipped(entry)}`),
          )
        : []),
    ].join('\n'),
  );

  if (Arr.isNonEmpty(mut_failures)) {
    console.error(`\n❌ ${mut_failures.join('\n\n❌ ')}`);

    return 1;
  }

  console.info('\n✅ Every entry passed and changed nothing.');

  return 0;
};

/**
 * The entries this machine runs, and the rest with what each needs: Chromium
 * for `browser: true`, Java for `java: true`, unless `all` is set. Of a skipped
 * entry that bundles root scripts (`run-s` / `run-p`), the parts `needs` does
 * not name still run, after the entry's build, so that a bundle's type check is
 * not lost with its browser tests.
 */
export const selectEntries = (
  entries: readonly ReadonlyRecord<string, string>[],
  {
    all,
    scripts,
    needs,
  }: Readonly<{
    all: boolean;
    /** The root manifest's scripts, to open a bundle up. */
    scripts: ReadonlyRecord<string, string>;
    /** What each part of a skipped bundle needs, by script name. */
    needs: ReadonlyRecord<string, string>;
  }>,
): EntrySelection => {
  const mut_run: Run[] = [];

  const mut_skipped: Skipped[] = [];

  const mut_named = new Set<string>();

  for (const [index, entry] of entries.entries()) {
    const { command } = entry;

    if (command === undefined) {
      continue;
    }

    const build = entry['build'];

    const entryNeeds = [
      // `true` the headless shell, `full` the full build, which a suite that
      // loads an extension needs (code-check.yml installs one or the other).
      ...(entry['browser'] === 'true'
        ? (['Chromium'] as const)
        : entry['browser'] === 'full'
          ? (['the full Chromium build'] as const)
          : ([] as const)),
      ...(entry['java'] === 'true' ? (['Java'] as const) : ([] as const)),
    ] as const;

    if (all || Arr.isEmpty(entryNeeds)) {
      mut_run.push({ command, build, entry: index });

      continue;
    }

    const parts = resolveScriptInvocations(scripts[command] ?? '').local;

    if (Arr.isEmpty(parts)) {
      mut_skipped.push({
        command,
        needs: entryNeeds.join(' and '),
        entry: index,
      });

      continue;
    }

    for (const part of parts) {
      const partNeeds = needs[part];

      if (partNeeds === undefined) {
        mut_run.push({ command: part, build, partOf: command, entry: index });
      } else {
        mut_named.add(part);

        mut_skipped.push({
          command: part,
          partOf: command,
          needs: partNeeds,
          entry: index,
        });
      }
    }
  }

  const stale = Object.keys(needs).filter(
    (part) => !all && !mut_named.has(part),
  );

  if (Arr.isNonEmpty(stale)) {
    throw new Error(
      `PART_NEEDS in check-all.mts names ${stale.join(', ')}, which no skipped matrix entry runs; remove the entry.`,
    );
  }

  return { run: mut_run, skipped: mut_skipped };
};

/**
 * Why an entry or part was not run: its build failed here, or failed for an
 * earlier entry, or a build its own covers ({@link BUILD_COVERS}) failed
 * earlier, which its own would too.
 */
export const notRunMessage = ({
  command,
  build,
  ...when
}: Readonly<
  {
    command: string;
    /** The entry's build. */
    build: string;
  } & (
    | { where: 'here' }
    | {
        where: 'above';
        /** The build that failed: `build` itself or one it covers. */
        failed: string;
      }
  )
>): string =>
  when.where === 'here'
    ? (`${command} was not run: its build, ${build}, failed.` as const)
    : when.failed === build
      ? (`${command} was not run: its build, ${build}, failed above.` as const)
      : (`${command} was not run: its build, ${build}, covers ${when.failed}, which failed above.` as const);

/** How a skipped entry or part is listed. */
export const describeSkipped = ({ command, partOf, needs }: Skipped): string =>
  `${command}${partOf === undefined ? '' : `, part of ${partOf}`} (needs ${needs}; run with --all)` as const;

/**
 * What ran against what the matrices hold, by entry: a bundle opened into its
 * parts counts as one entry rather than its parts as entries, and as run once
 * any part of it ran; one that ran nothing because its build failed counts as
 * not run, and one whose every part was skipped as skipped.
 * Entries are told apart by their place among the matrix entries, not by their
 * command, so that two matrices listing one command count as two, and an entry
 * run whole is not taken for a bundle of its name.
 */
export const summarizeRun = ({
  entries,
  ran,
  notRun,
  skipped,
}: Readonly<{
  /** The matrix entries, as read; those naming no command are not counted. */
  entries: readonly ReadonlyRecord<string, string>[];
  ran: readonly Run[];
  /** Those not run because their build failed. */
  notRun: readonly Run[];
  skipped: readonly Skipped[];
}>): string => {
  const total = entries.filter(({ command }) => command !== undefined).length;

  const ranWhole = ran.filter(({ partOf }) => partOf === undefined).length;

  const partsRan = ran.length - ranWhole;

  const ranEntries = new Set<number>(ran.map(({ entry }) => entry));

  // An entry part of which ran is counted as run; one that ran nothing and
  // whose build failed, as not run.
  const notRunEntries = Arr.uniq(notRun.map(({ entry }) => entry)).filter(
    (entry) => !ranEntries.has(entry),
  );

  const counted = new Set<number>([...ranEntries, ...notRunEntries]);

  const skippedWhole = Arr.uniq(skipped.map(({ entry }) => entry)).filter(
    (entry) => !counted.has(entry),
  ).length;

  return [
    `Ran ${ranWhole} of the ${total} matrix entries whole`,
    ...(partsRan === 0
      ? []
      : [
          `, and ${plural(partsRan, 'part')} of ${plural(ranEntries.size - ranWhole, 'other')}`,
        ]),
    ...(Arr.isEmpty(notRunEntries)
      ? []
      : [`; ${notRunEntries.length} not run after their build failed`]),
    ...(skippedWhole === 0 ? [] : [`; skipped ${skippedWhole} whole`]),
    '.',
  ].join('');
};

/**
 * Whether an entry's build is to run: not when there is none or an earlier
 * entry ran it or a build that covers it ({@link BUILD_COVERS}), and not when
 * it failed or a build it covers did, whose entries are then reported rather
 * than run, naming the build that failed.
 */
export const planBuild = (
  { built, failed }: BuildMemory,
  build: string | undefined,
): Readonly<
  | { kind: 'none' }
  | { kind: 'run'; build: string }
  | {
      kind: 'failed';
      build: string;
      /** The build that failed: `build` itself or one it covers. */
      failed: string;
    }
> => {
  if (build === undefined) {
    return { kind: 'none' };
  }

  // A build fails as what it builds failed, and is done as what builds it was.
  const failedBuild = Arr.toUnshifted(build)(
    BUILD_COVERS.get(build) ?? [],
  ).find((candidate) => failed.has(candidate));

  if (failedBuild !== undefined) {
    return { kind: 'failed', build, failed: failedBuild };
  }

  return built.has(build) ||
    Array.from(built).some((done) =>
      (BUILD_COVERS.get(done) ?? []).includes(build),
    )
    ? { kind: 'none' }
    : { kind: 'run', build };
};

/**
 * The memory after an entry: its build, if it ran one, as built or failed; and
 * nothing else once the entry changed a file a build reads, since a build from
 * before may then be older than its sources (`ws:gen` before `ws:doc`). A write
 * no build reads (a formatted Markdown file) keeps the memory.
 *
 * A build that failed is remembered as failed whatever it wrote: the entry ran
 * nothing after it, so what it wrote is its own, and a build writes no source
 * (`CLAUDE.md`, "Build"), so running it again would fail again. It leaves no
 * other built either: a package's build empties its `dist/` before it writes,
 * so a failure partway can take out what an earlier build wrote.
 */
export const rememberBuild = (
  memory: BuildMemory,
  {
    build,
    failed,
    wrote,
    readByBuilds,
  }: Readonly<{
    build: string | undefined;
    failed: boolean;
    wrote: readonly string[];
    /** Whether a build reads a path (what the code gate does not ignore). */
    readByBuilds: (file: string) => boolean;
  }>,
): BuildMemory =>
  build !== undefined && failed
    ? ({
        built: new Set<string>(),
        failed: new Set<string>([...memory.failed, build]),
      } as const)
    : wrote.some(readByBuilds)
      ? NO_BUILDS
      : build === undefined
        ? memory
        : ({
            built: new Set<string>([...memory.built, build]),
            failed: memory.failed,
          } as const);

/**
 * What the entries run so far say about the builds: those that ran and those
 * that failed, on the tree as it is now.
 */
export type BuildMemory = Readonly<{
  built: ReadonlySet<string>;
  failed: ReadonlySet<string>;
}>;

export const NO_BUILDS: BuildMemory = {
  built: new Set<string>(),
  failed: new Set<string>(),
} as const;

/** The builds each build runs too: `ws:build` builds every package. */
const BUILD_COVERS: ReadonlyMap<string, readonly string[]> = new Map<
  string,
  readonly string[]
>([['ws:build', ['ws:build:deps']]]);

type Run = Readonly<{
  command: string;
  build: string | undefined;
  /** The bundle a part was opened out of. */
  partOf?: string;
  /**
   * The place of its matrix entry among those `selectEntries` was given, which
   * tells it apart; `summarizeRun` is given the same entries.
   */
  entry: number;
}>;

type Skipped = Readonly<{
  command: string;
  partOf?: string;
  /** What it needs that this machine lacks, in words. */
  needs: string;
  /** As {@link Run}'s. */
  entry: number;
}>;

type EntrySelection = Readonly<{
  run: readonly Run[];
  skipped: readonly Skipped[];
}>;

/**
 * What a part of a matrix entry that needs Chromium or Java needs, for the
 * parts that cannot run without it; every other part runs on its own.
 */
const PART_NEEDS: ReadonlyRecord<string, string> = {
  // Each package's whole Vitest, its Browser project included where it has one.
  // The whole coverage run, since a bundle's parts are what is skipped or run:
  // its heavy suites need no browser, but run with the light ones.
  'ws:check:test:cov': 'Chromium',
  // An extension's suite loads its build, which needs the full Chromium build.
  'ws:check:e2e': 'the full Chromium build',
  'ws:check:e2e:emulators': 'Chromium and Java',
  'ws:check:test:rules': 'Java',
} as const;

export const MATRIX_WORKFLOWS = [
  '.github/workflows/code-check.yml',
  '.github/workflows/style-check.yml',
] as const;

if (isDirectlyExecuted(import.meta.url)) {
  const exitCode = await checkAll().catch((error: unknown) => {
    console.error(unknownToString(error));

    return 2;
  });

  process.exit(exitCode);
}
