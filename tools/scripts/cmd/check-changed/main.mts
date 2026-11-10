import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import * as util from 'node:util';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { isChangesetPath, listChangesetBumps } from '../../lib/changesets.mjs';
import { isChromeExtension } from '../../lib/chrome-extensions.mjs';
import { formatLineRanges, parseAddedLines } from '../../lib/diff-lines.mjs';
import {
  diffSnapshots,
  git,
  isRegularFile,
  snapshotTree,
  spawnPnpm,
  splitZ,
} from '../../lib/step-runner.mjs';
import { projectRootPath } from '../../project-root-path.mjs';
import { findMissingChangesets } from './changesets.mjs';
import {
  checkCommitMessages,
  readJapanesePattern,
  type Commit,
} from './commit-messages.mjs';
import { parseLcov, uncoveredChangedLines } from './coverage.mjs';
import { readPackages, readProseGate, scriptsOf } from './packages.mjs';
import {
  buildPlan,
  classifyChanges,
  stepEnvironment,
  type PackageInfo,
  type Step,
} from './plan.mjs';

/**
 * Runs the checks a diff needs, and only those. README.md beside this file says
 * what runs when, and what is left to CI.
 */
const main = async (): Promise<number> => {
  const options = parseOptions();

  if (options === 'help') {
    console.info(USAGE);

    return 0;
  }

  if (options === undefined) {
    console.error(USAGE);

    return 2;
  }

  const mergeBase = await git(['merge-base', 'HEAD', options.baseRef]);

  const base = mergeBase.trim();

  const tracked = splitZ(
    await git(['diff', '--name-only', '--no-renames', '-z', base, '--']),
  );

  const untracked = await listUntracked();

  const changedFiles = Arr.uniq([...tracked, ...untracked]).toSorted();

  console.info(
    `check-changed: ${changedFiles.length} file(s) changed since ${base.slice(0, 12)} (the merge base with ${options.baseRef})${Arr.isNonEmpty(untracked) ? `, ${untracked.length} of them untracked` : ''}.\n`,
  );

  if (Arr.isEmpty(changedFiles)) {
    return 0;
  }

  const rootScripts = scriptsOf(await readJson('package.json'));

  const proseGate = readProseGate();

  if (Result.isErr(proseGate)) {
    console.error(proseGate.value);

    return 2;
  }

  const packages = await readPackages();

  const classification = classifyChanges({
    files: changedFiles,
    packages,
    proseGate: proseGate.value,
  });

  const existing = await filterExisting(changedFiles);

  const plan = buildPlan({
    classification,
    base,
    rootScripts: Array.from(rootScripts.keys()),
    coverage: options.coverage,
    spellChecked: existing.filter(
      (file) => !classification.ignored.includes(file),
    ),
  });

  // What is read rather than run comes first: it is quick and needs no tree.
  const commits = await checkCommits(base);

  const changesetWarnings = await checkChangesets(changedFiles, packages);

  const notes = [
    ...(Arr.isNonEmpty(classification.ignored)
      ? ([
          `${classification.ignored.length} file(s) under experimental/ are outside every check.`,
        ] as const)
      : ([] as const)),
    ...(classification.areas.has('repo-settings')
      ? ([
          'repo-settings/ changed: nothing applies it until `pnpm run repo-settings:apply` is run by hand (repo-settings/README.md).',
        ] as const)
      : ([] as const)),
    ...(classification.areas.has('manifest')
      ? ([
          'A manifest or the lockfile changed: build what depends on it (`pnpm run ws:build:deps`) before trusting its dependents, which this does not check.',
        ] as const)
      : ([] as const)),
    ...(classification.areas.has('shared-config')
      ? ([
          'tools/configs/ changed: the packages that consume it are not checked here; run the `ws:*` command for what it configures (`ws:check:types`, `ws:check:test`, `ws:fix:lint`).',
        ] as const)
      : ([] as const)),
  ] as const;

  const env = stepEnvironment(base);

  console.info(
    Arr.toUnshifted(
      plan.map((step, i) => `  ${i + 1}. ${describe(step)}`),
      `Plan (every step with ${Object.entries(env)
        .map(([name, value]) => `${name}=${value}`)
        .join(' ')}):`,
    ).join('\n'),
  );

  const run = options.dryRun
    ? ({ ran: [], failures: [], notes: [] } as const)
    : await runPlan({
        plan,
        env,
        // Read when a coverage report is, not now: the formatter, the fixers
        // and the codemod run first and move the lines.
        readChangedLines: options.coverage
          ? async () => collectAddedLines(base)
          : undefined,
      });

  const failures = [...commits.failures, ...run.failures] as const;

  printSummary({
    ran: run.ran,
    failures,
    warnings: [...commits.warnings, ...changesetWarnings],
    notes: [...notes, ...run.notes],
  });

  return Arr.isEmpty(failures) ? 0 : 1;
};

type Options = Readonly<{
  baseRef: string;
  dryRun: boolean;
  coverage: boolean;
}>;

const parseOptions = (): Options | 'help' | undefined => {
  const parsed = (() => {
    try {
      return util.parseArgs({
        options: {
          base: { type: 'string' },
          'dry-run': { type: 'boolean', default: false },
          'no-coverage': { type: 'boolean', default: false },
          help: { type: 'boolean', default: false },
        },
        strict: true,
      }).values;
    } catch (error: unknown) {
      console.error(unknownToString(error));

      return undefined;
    }
  })();

  if (parsed === undefined) {
    return undefined;
  }

  if (parsed.help) {
    return 'help';
  }

  const baseRef = parsed.base ?? 'origin/main';

  if (baseRef.startsWith('-')) {
    console.error(`--base must name a revision, not an option: ${baseRef}`);

    return undefined;
  }

  return {
    baseRef,
    dryRun: parsed['dry-run'],
    coverage: !parsed['no-coverage'],
  };
};

const USAGE = [
  'Usage: pnpm run check-changed [--base <ref>] [--dry-run] [--no-coverage]',
  '',
  '  --base <ref>    diff from the merge base with <ref> (default: origin/main);',
  '                  a stacked pull request passes the branch it is based on',
  '  --dry-run       print the plan and the commit and changeset findings only',
  '  --no-coverage   run the tests without listing the changed lines they miss',
].join('\n');

const reportCoverage = async ({
  reportsDirectory,
  packageDir,
  addedLines,
}: Readonly<{
  reportsDirectory: string;
  packageDir: string;
  addedLines: ReadonlyMap<string, readonly number[]>;
}>): Promise<readonly string[]> => {
  const label = packageDir === '.' ? 'tools/' : packageDir;

  const lcovPath = path.join(reportsDirectory, 'lcov.info');

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the temporary directory this run made.
  const lcov = await fs.readFile(lcovPath, 'utf8').catch(() => undefined);

  if (lcov === undefined) {
    return [`No coverage report was written for ${label}.`];
  }

  const prefix = packageDir === '.' ? 'tools/' : (`${packageDir}/` as const);

  const uncovered = uncoveredChangedLines({
    changedLines: new Map(
      Array.from(addedLines).filter(([file]) => file.startsWith(prefix)),
    ),
    coverage: parseLcov({
      lcov,
      packageDir: path.join(projectRootPath, packageDir),
      rootDir: projectRootPath,
    }),
  });

  return uncovered.size === 0
    ? []
    : [
        Arr.toUnshifted(
          Array.from(
            uncovered,
            ([file, lines]) =>
              `      ${file}: ${formatLineRanges(lines, REPORTED_RANGES)}`,
          ),
          `Changed lines in ${label} that no test executes (a report, not a failure):`,
        ).join('\n'),
      ];
};

/**
 * Runs `pnpm` with the step's arguments and the run's `env`, its output passed
 * straight through.
 * A coverage step gets Vitest's options appended, which `pnpm run` hands on to
 * the last command of the script — `vitest` in the `check:test` of every
 * package with a `check:test:cov`, and in `check:root:test`. The reporter is
 * narrowed to `lcov` and written to a temporary directory, so a package's own
 * `coverage/` is left alone.
 */
const runPnpm = async (
  step: Step,
  reportsDirectory: string | undefined,
  env: ReadonlyRecord<string, string>,
): Promise<number> => {
  const coverageArgs =
    reportsDirectory === undefined
      ? ([] as const)
      : ([
          '--coverage.enabled=true',
          ...(step.coverage?.packageDir === '.'
            ? // The shared config's default `include` (`src/**`) reaches
              // nothing under tools/.
              ([
                '--coverage.include=tools/**/*.mts',
                '--coverage.exclude=**/*.test.mts',
              ] as const)
            : ([] as const)),
          '--coverage.reporter=lcov',
          `--coverage.reportsDirectory=${reportsDirectory}`,
          // A failing test is the run where the report matters most.
          '--coverage.reportOnFailure=true',
        ] as const);

  return spawnPnpm({
    args: [...step.args, ...coverageArgs],
    cwd: step.cwd,
    env,
  });
};

/** A step as the plan prints it, a long argument list cut short. */
const describe = (step: Step): string => {
  const shown = step.args.slice(0, DESCRIBED_ARGS);

  const rest = step.args.length - shown.length;

  return [
    `[${step.kind}]`,
    step.cwd === '.' ? '' : `(${step.cwd})`,
    'pnpm',
    ...shown,
    rest > 0 ? `… (+${rest})` : '',
  ]
    .filter((part) => part !== '')
    .join(' ');
};

/**
 * Runs the steps one after another, all of them whatever fails, and says what
 * each wrote to the tree: a generator that wrote anything fails the run, since
 * that is the diff CI's `assert-repo-is-clean` would fail on with no hint which
 * generator wrote it.
 *
 * Only what is still changed at the end is reported. The codemod reprints every
 * file it reads, and the formatter after it puts most of them back; a step's
 * write that a later step undid is not something to review.
 */
const runPlan = async ({
  plan,
  env,
  readChangedLines,
}: Readonly<{
  plan: readonly Step[];
  /** What each step adds to the environment. */
  env: ReadonlyRecord<string, string>;
  /** Absent with `--no-coverage`. */
  readChangedLines:
    (() => Promise<ReadonlyMap<string, readonly number[]>>) | undefined;
}>): Promise<
  Readonly<{
    ran: readonly string[];
    failures: readonly string[];
    notes: readonly string[];
  }>
> => {
  const coverageRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), 'check-changed-coverage-'),
  );

  const mut_ran: string[] = [];

  const mut_failures: string[] = [];

  const mut_notes: string[] = [];

  const mut_writes: (readonly [Step, readonly string[]])[] = [];

  const initial = await snapshotTree();

  // The tree after each step, the last of which is the next step's "before".
  // A step that wrote nothing repeats the snapshot before it, so that the
  // changed-lines cache below is keyed by what the tree holds.
  const mut_snapshots: ReadonlyMap<string, string>[] = [initial];

  const latestSnapshot = (): ReadonlyMap<string, string> =>
    mut_snapshots.at(-1) ?? initial;

  // The changed lines, read again only once a step has rewritten the tree.
  const mut_changedLines = new Map<
    ReadonlyMap<string, string>,
    ReadonlyMap<string, readonly number[]>
  >();

  const changedLinesNow = async (): Promise<
    ReadonlyMap<string, readonly number[]>
  > => {
    const snapshot = latestSnapshot();

    const cached = mut_changedLines.get(snapshot);

    if (cached !== undefined || readChangedLines === undefined) {
      return cached ?? new Map<string, readonly number[]>();
    }

    const lines = await readChangedLines();

    mut_changedLines.set(snapshot, lines);

    return lines;
  };

  try {
    for (const [index, step] of plan.entries()) {
      console.info(`\n=== ${index + 1}/${plan.length} ${describe(step)}\n`);

      // Every step is watched, not only the generators and fixers:
      // `check:root:lint` runs `eslint --fix`, and a check that writes is worth
      // knowing about whatever its name says.
      const before = latestSnapshot();

      const reportsDirectory =
        readChangedLines === undefined || step.coverage === undefined
          ? undefined
          : path.join(coverageRoot, `step-${index}`);

      const started = performance.now();

      const exitCode = await runPnpm(step, reportsDirectory, env);

      const seconds = ((performance.now() - started) / 1000).toFixed(1);

      const after = await snapshotTree();

      const rewritten = diffSnapshots(before, after);

      mut_snapshots.push(Arr.isEmpty(rewritten) ? before : after);

      mut_ran.push(
        `${exitCode === 0 ? 'ok  ' : 'FAIL'} ${step.title} (${seconds} s)`,
      );

      if (exitCode !== 0) {
        mut_failures.push(`${step.title} exited with ${exitCode}.`);
      }

      if (Arr.isNonEmpty(rewritten)) {
        mut_writes.push([step, rewritten]);
      }

      if (
        reportsDirectory !== undefined &&
        readChangedLines !== undefined &&
        step.coverage !== undefined
      ) {
        mut_notes.push(
          ...(await reportCoverage({
            reportsDirectory,
            packageDir: step.coverage.packageDir,
            addedLines: await changedLinesNow(),
          })),
        );
      }
    }
  } finally {
    await fs.rm(coverageRoot, { recursive: true, force: true });
  }

  const changedByRun: ReadonlySet<string> = new Set<string>(
    diffSnapshots(initial, latestSnapshot()),
  );

  for (const [step, rewritten] of mut_writes) {
    const kept = rewritten.filter((file) => changedByRun.has(file));

    if (Arr.isEmpty(kept)) {
      continue;
    }

    const list = kept.map((file) => `      ${file}`).join('\n');

    if (step.kind === 'generate') {
      mut_failures.push(
        `The generator \`${describe(step)}\` changed the tree; review and commit what it wrote:\n${list}`,
      );
    } else {
      mut_notes.push(
        `\`${describe(step)}\` rewrote these; review and commit them:\n${list}`,
      );
    }
  }

  return { ran: mut_ran, failures: mut_failures, notes: mut_notes };
};

/** Reads a repository-relative file. */
const readText = async (file: string): Promise<string> => {
  const absolute = path.join(projectRootPath, file);

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a repository path from the diff or a manifest.
  return fs.readFile(absolute, 'utf8');
};

const checkCommits = async (
  base: string,
): Promise<
  Readonly<{ failures: readonly string[]; warnings: readonly string[] }>
> => {
  const pattern = readJapanesePattern(await readText(LINT_PULL_REQUEST));

  if (pattern === undefined) {
    return {
      failures: [
        `${LINT_PULL_REQUEST} no longer declares JAPANESE_PATTERN in the shape commit-messages.mts reads; update the reader.`,
      ],
      warnings: [],
    };
  }

  const log = await git([
    'log',
    '--reverse',
    '--format=%H%x00%B%x1e',
    `${base}..HEAD`,
  ]);

  const commits: readonly Commit[] = log
    .split(RECORD_SEPARATOR)
    .map((record) => record.replace(LEADING_NEWLINE, ''))
    .filter((record) => record.includes('\0'))
    .map((record) => {
      const [sha = '', message = ''] = record.split('\0', 2);

      return { sha, message };
    });

  if (Arr.isEmpty(commits)) {
    return {
      failures: [],
      warnings: [
        'No commits on the branch yet, so the commit messages were not checked.',
      ],
    };
  }

  const result = checkCommitMessages({ commits, japanesePattern: pattern });

  return { failures: result.errors, warnings: result.warnings };
};

/** The repository-relative files of the list that exist. */
const filterExisting = async (
  files: readonly string[],
): Promise<readonly string[]> => {
  const present = await Promise.all(
    files.map(async (file) => {
      const absolute = path.join(projectRootPath, file);

      return fs
        .access(absolute)
        .then(() => true)
        .catch(() => false);
    }),
  );

  return files.filter((_, i) => present[i] === true);
};

const checkChangesets = async (
  changedFiles: readonly string[],
  packages: readonly PackageInfo[],
): Promise<readonly string[]> => {
  const isReleased = await Promise.all(
    packages.map(async (pkg) => {
      const isLibrary = pkg.dir.startsWith('libs/') && !pkg.isPrivate;

      return isLibrary || (await isChromeExtension(pkg.dir));
    }),
  );

  const released = packages.filter((_, i) => isReleased[i] === true);

  const changesetFiles = await filterExisting(
    changedFiles.filter(isChangesetPath),
  );

  const changesets = await Promise.all(
    changesetFiles.map(async (file) => ({
      file,
      content: await readText(file),
    })),
  );

  // A changeset `changeset version` would refuse is reported by
  // `check:cspell:changeset` and every release guard; here it is a warning
  // beside the rest, so that the checks after this one still run.
  const parsed = changesets.map((changeset) => ({
    changeset,
    result: Result.fromThrowable(() => listChangesetBumps([changeset])),
  }));

  const unreadable = Arr.generate(function* () {
    for (const { result } of parsed) {
      if (Result.isErr(result)) {
        yield unknownToString(result.value);
      }
    }
  });

  const missing = findMissingChangesets({
    changedFiles,
    released,
    changesets: parsed
      .filter(({ result }) => Result.isOk(result))
      .map(({ changeset }) => changeset),
  });

  return Arr.isNonEmpty(missing)
    ? Arr.toPushed(
        unreadable,
        Arr.isNonEmpty(unreadable)
          ? `src/ changed and no readable changeset in the diff names ${missing.join(', ')}. Fix the unreadable one above if it is meant to; otherwise, if the change is user-visible, run \`pnpm changeset\` (CLAUDE.md, "Releases").`
          : `src/ changed and no changeset in the diff names ${missing.join(', ')}. If the change is user-visible, run \`pnpm changeset\` (CLAUDE.md, "Releases").`,
      )
    : unreadable;
};

/**
 * The untracked files, without the `dir/` git lists for an untracked nested
 * repository, which no check could read.
 */
const listUntracked = async (): Promise<readonly string[]> =>
  splitZ(
    await git(['ls-files', '--others', '--exclude-standard', '-z']),
  ).filter((file) => !file.endsWith('/'));

/**
 * The lines the diff added or changed, by file: the `-U0` hunks of what git
 * tracks, and every line of an untracked file.
 */
const collectAddedLines = async (
  base: string,
): Promise<ReadonlyMap<string, readonly number[]>> => {
  const untracked = await listUntracked();

  const trackedLines = parseAddedLines(
    await git([
      '-c',
      'core.quotePath=false',
      'diff',
      // Whatever path prefixes the user's git config asks diffs for, the parser
      // reads `+++ b/<path>`.
      '--src-prefix=a/',
      '--dst-prefix=b/',
      '-U0',
      '--no-color',
      '--no-ext-diff',
      '--no-renames',
      base,
      '--',
    ]),
  );

  const mut_lines = new Map<string, readonly number[]>(trackedLines);

  // A symlink to a directory is listed as one untracked path, and has no lines.
  const untrackedFiles = untracked.filter(isRegularFile);

  for (const file of untrackedFiles) {
    const content = await readText(file);

    const count = content.split('\n').length;

    mut_lines.set(
      file,
      Array.from({ length: count }, (_, i) => i + 1),
    );
  }

  return mut_lines;
};

const printSummary = ({
  ran,
  failures,
  warnings,
  notes,
}: Readonly<{
  ran: readonly string[];
  failures: readonly string[];
  warnings: readonly string[];
  notes: readonly string[];
}>): void => {
  const sections = [
    ['Ran', ran],
    ['Notes', notes],
    ['Warnings', warnings],
    ['Failures', failures],
  ] as const;

  console.info(
    [
      '\n=== check-changed summary',
      ...sections
        .filter(([, items]) => Arr.isNonEmpty(items))
        .map(([label, items]) =>
          Arr.toUnshifted(
            items.map((item) => `  - ${item}`),
            `\n${label}:`,
          ).join('\n'),
        ),
      Arr.isEmpty(failures)
        ? '\nNo failures.'
        : `\n${failures.length} failure(s).`,
    ].join('\n'),
  );
};

const readJson = async (file: string): Promise<unknown> =>
  JSON.parse(await readText(file));

const LINT_PULL_REQUEST = '.github/workflows/lint-pull-request.yml';

const DESCRIBED_ARGS = 8;

/** Ranges of uncovered lines listed per file before the rest is counted. */
const REPORTED_RANGES = 12;

const RECORD_SEPARATOR = '\u{1E}';

const LEADING_NEWLINE = /^\n/u;

if (isDirectlyExecuted(import.meta.url)) {
  const exitCode = await main().catch((error: unknown) => {
    console.error(unknownToString(error));

    return 2;
  });

  process.exit(exitCode);
}
