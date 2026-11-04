import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as util from 'node:util';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { spawnPnpm } from '../lib/step-runner.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import {
  readMatrixInclude,
  readRootManifest,
  resolveScriptInvocations,
} from './check-ci-commands.mjs';
import { runJob } from './ci-job.mjs';

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
 *   `pnpm exec playwright install chromium`, for `ws:check:e2e:shard-2`, whose
 *   suites may load an extension) and a Java 21 are in place.
 * - The other check workflows: `strict-lib-gen.yml` (its generators rewrite
 *   thousands of files), `node-version-compatibility.yml` (other Node
 *   versions), `verify-published-packages.yml` (what the registry serves) and
 *   `synstate-benchmark.yml`.
 * - A build an earlier entry already ran (`ws:build` covers `ws:build:deps`)
 *   is not run again. CI's jobs start from a clean tree each; here an entry
 *   that rewrote the tree is reported and the next one runs on what it left.
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
    MATRIX_WORKFLOWS.map(async (workflow) =>
      readMatrixInclude(
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixed path in this repository.
        await fs.readFile(path.join(projectRootPath, workflow), 'utf8'),
      ),
    ),
  );

  const entries = matrices.flat();

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
        ...selected.skipped.map((entry) => `skipped: ${entry}`),
      ].join('\n'),
    );

    return 0;
  }

  console.info('Installing dependencies...');

  if ((await spawnPnpm({ args: ['install'], cwd: '.', env: {} })) !== 0) {
    console.error('❌ pnpm install failed.');

    return 1;
  }

  const mut_built = new Set<string>();

  const mut_failures: string[] = [];

  for (const [index, { command, build }] of selected.run.entries()) {
    console.info(`\n##### ${index + 1}/${selected.run.length} ${command}`);

    const needed =
      build === undefined ||
      mut_built.has(build) ||
      (build === 'ws:build:deps' && mut_built.has('ws:build'))
        ? undefined
        : build;

    const outcome = await runJob({
      command,
      build: needed,
      requireCleanStart: false,
    });

    if (needed !== undefined && !outcome.buildFailed) {
      mut_built.add(needed);
    }

    mut_failures.push(...outcome.failures);
  }

  console.info(
    [
      '',
      `Ran ${selected.run.length} of the ${entries.length} matrix entries.`,
      ...(Arr.isNonEmpty(selected.skipped)
        ? Arr.toUnshifted('Skipped:')(
            selected.skipped.map((entry) => `  - ${entry}`),
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
): Readonly<{
  run: readonly Readonly<{ command: string; build: string | undefined }>[];
  skipped: readonly string[];
}> => {
  const mut_run: Readonly<{ command: string; build: string | undefined }>[] =
    [];

  const mut_skipped: string[] = [];

  const mut_named = new Set<string>();

  for (const entry of entries) {
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
      mut_run.push({ command, build });

      continue;
    }

    const parts = resolveScriptInvocations(scripts[command] ?? '').local;

    if (Arr.isEmpty(parts)) {
      mut_skipped.push(
        `${command} (needs ${entryNeeds.join(' and ')}; run with --all)`,
      );

      continue;
    }

    for (const part of parts) {
      const partNeeds = needs[part];

      if (partNeeds === undefined) {
        mut_run.push({ command: part, build });
      } else {
        mut_named.add(part);

        mut_skipped.push(
          `${part}, part of ${command} (needs ${partNeeds}; run with --all)`,
        );
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
 * What a part of a matrix entry that needs Chromium or Java needs, for the
 * parts that cannot run without it; every other part runs on its own.
 */
const PART_NEEDS: ReadonlyRecord<string, string> = {
  // Each package's whole Vitest, its Browser project included where it has one.
  // Shard 1's four packages have none (`browser: false`), and run.
  'ws:check:test:cov:shard-2': 'Chromium',
  'ws:check:e2e:shard-1': 'Chromium',
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
