import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as util from 'node:util';
import { Arr, asPositiveUint32, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { diffSnapshots, snapshotTree, spawnPnpm } from '../lib/step-runner.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Runs one entry of a check workflow's matrix: what the entry reads is built,
 * the entry runs, and a step that changed the tree fails the job, naming itself
 * and the files. That is the matrix job of `code-check.yml` and
 * `style-check.yml` whole, so the job is one call of this, and `check-all.mts`
 * runs the same entries through the same runner.
 *
 * The comparison is `check-changed`'s (`tools/scripts/lib/step-runner.mts`),
 * where the clean-tree check `z:assert-repo-is-clean` named no step: a dirty
 * tree after a generator bundle now says which part of the bundle to run.
 *
 * ```sh
 * pnpm run z:ci-job --build ws:build:deps --command check:root
 * ```
 */
export const runJob = async ({
  command,
  build,
  requireCleanStart,
}: Readonly<{
  command: string;
  build: string | undefined;
  /**
   * Whether a tree changed before the first step fails the job, and the diff of
   * what the steps wrote is printed: in CI (`GITHUB_ACTIONS`), where the
   * checkout starts clean and a change is what setup or `pnpm install` wrote.
   * Not on a working tree: `check-all`, or `z:ci-job` run by hand.
   */
  requireCleanStart: boolean;
}>): Promise<JobOutcome> => {
  const initial = snapshotTree();

  const mut_state = { before: initial };

  const mut_results: StepResult[] = [];

  for (const step of jobSteps({ command, build })) {
    console.info(`\n=== ${step.title}\n`);

    const exitCode = await spawnPnpm({
      args: step.args,
      cwd: '.',
      // As GitHub Actions sets it, for a run outside it (`check-all`).
      env: { CI: 'true' },
    });

    const after = snapshotTree();

    mut_results.push({
      title: step.title,
      exitCode,
      wrote: diffSnapshots(mut_state.before, after),
    });

    mut_state.before = after;

    // A failed build leaves nothing for the command to read.
    if (exitCode !== 0) {
      break;
    }
  }

  // Only on a tree that started clean, where the diff is the steps' alone;
  // `check-all`'s working tree may hold edits of its own.
  if (requireCleanStart) {
    printWrites(Arr.uniq(mut_results.flatMap(({ wrote }) => wrote)));
  }

  return {
    failures: [
      ...(requireCleanStart
        ? dirtyStartFailures(Array.from(initial.keys()))
        : []),
      ...jobFailures(mut_results),
    ],
    buildFailed:
      build !== undefined && (mut_results.at(0)?.exitCode ?? 1) !== 0,
  };
};

/** A tree already changed before the job's first step. */
export const dirtyStartFailures = (
  changed: readonly string[],
): readonly string[] =>
  Arr.isEmpty(changed)
    ? ([] as const)
    : ([
        Arr.toUnshifted(
          'The tree was changed before the first step ran (by the setup or `pnpm install`):',
        )(changed.map((file) => `      ${file}`)).join('\n'),
      ] as const);

/** The build, if the entry reads one, then the entry. */
export const jobSteps = ({
  command,
  build,
}: Readonly<{
  command: string;
  build: string | undefined;
}>): readonly Readonly<{ title: string; args: readonly string[] }>[] => {
  const entry = { title: command, args: ['run', command] } as const;

  return build === undefined
    ? [entry]
    : [{ title: build, args: ['run', build] }, entry];
};

/**
 * A step that exited non-zero, and a step that changed the tree (what
 * `z:assert-repo-is-clean` reported, with the step named).
 */
export const jobFailures = (
  results: readonly StepResult[],
): readonly string[] =>
  results.flatMap(({ title, exitCode, wrote }) => [
    ...(exitCode === 0 ? [] : [`${title} exited with ${exitCode}.`]),
    ...(Arr.isEmpty(wrote)
      ? []
      : [
          Arr.toUnshifted(
            `\`${title}\` changed the tree; run it locally and commit what it writes:`,
          )(wrote.map((file) => `      ${file}`)).join('\n'),
        ]),
  ]);

export type JobOutcome = Readonly<{
  failures: readonly string[];
  /** Whether the build ran and failed, so that the entry never ran. */
  buildFailed: boolean;
}>;

export type StepResult = Readonly<{
  title: string;
  exitCode: number;
  /** The paths the step changed. */
  wrote: readonly string[];
}>;

const DIFF_BATCH = asPositiveUint32(500);

const USAGE =
  'Usage: pnpm run z:ci-job [--build <root script>] --command <root script>';

/**
 * What a step wanted the files it changed to hold, as `z:assert-repo-is-clean`
 * printed it (an untracked file is listed, not shown). Literal pathspecs, in
 * batches, so that thousands of rewritten files stay under the argument limit.
 */
const printWrites = (written: readonly string[]): void => {
  for (const batch of Arr.partition(written, DIFF_BATCH)) {
    const result = spawnSync(
      'git',
      [
        '--no-pager',
        '--literal-pathspecs',
        'diff',
        '--no-ext-diff',
        '--no-color',
        '--',
        ...batch,
      ],
      { cwd: projectRootPath, stdio: 'inherit' },
    );

    if (result.error !== undefined || result.status !== 0) {
      console.error(
        `git diff of the changed files failed: ${unknownToString(result.error ?? result.signal ?? result.status)}`,
      );

      return;
    }
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  const exitCode = await (async (): Promise<number> => {
    const { values } = util.parseArgs({
      options: {
        command: { type: 'string' },
        build: { type: 'string' },
      },
      strict: true,
    });

    if (values.command === undefined || values.command.startsWith('-')) {
      console.error(USAGE);

      return 2;
    }

    const outcome = await runJob({
      command: values.command,
      build: values.build,
      // A CI checkout starts clean; a local tree need not.
      requireCleanStart: process.env['GITHUB_ACTIONS'] === 'true',
    });

    if (Arr.isNonEmpty(outcome.failures)) {
      console.error(`\n❌ ${outcome.failures.join('\n\n❌ ')}`);
    }

    // For the report step after it, which explains the entry, not a build.
    const output = process.env['GITHUB_OUTPUT'];

    if (output !== undefined && outcome.buildFailed) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- the step output file GitHub Actions names.
      await fs.appendFile(output, 'build-failed=true\n');
    }

    if (Arr.isNonEmpty(outcome.failures)) {
      return 1;
    }

    console.info(`\n✅ ${values.command} passed and changed nothing.`);

    return 0;
  })().catch((error: unknown) => {
    console.error(unknownToString(error));

    return 2;
  });

  process.exit(exitCode);
}
