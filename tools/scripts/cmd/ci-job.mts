import * as fs from 'node:fs/promises';
import * as util from 'node:util';
import { Arr, asPositiveUint32, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { runInherited } from '../lib/child-process.mjs';
import { plural } from '../lib/plural.mjs';
import {
  diffSnapshots,
  git,
  snapshotTree,
  spawnPnpm,
  splitZ,
} from '../lib/step-runner.mjs';
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
   * Whether a tree changed before the first step fails the job: in CI
   * (`GITHUB_ACTIONS`), where the checkout starts clean and a change is what
   * setup or `pnpm install` wrote. Not on a working tree: `check-all`, or
   * `z:ci-job` run by hand to reproduce a job, which still prints the diff.
   */
  requireCleanStart: boolean;
}>): Promise<JobOutcome> => {
  const initial = await snapshotTree();

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

    const after = await snapshotTree();

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

  const wrote = Arr.uniq(mut_results.flatMap((result) => result.wrote));

  await printWrites(writesToShow({ written: wrote, changedAtStart: initial }));

  return {
    failures: [
      ...(requireCleanStart
        ? dirtyStartFailures(Array.from(initial.keys()))
        : []),
      ...jobFailures(mut_results),
    ],
    buildFailed:
      build !== undefined && (mut_results.at(0)?.exitCode ?? 1) !== 0,
    commandFailure: commandFailureOf(
      mut_results,
      requireCleanStart && initial.size > 0,
    ),
    wrote,
  };
};

/**
 * Why the job failed for more than a diff, if it did: the first step, the build
 * or the command, that exited non-zero, or the setup having changed the tree
 * before either ran. A fixer reruns the command; it fixes neither a step that
 * fails nor what the setup writes, which is not the pull request's to commit.
 */
export const commandFailureOf = (
  results: readonly StepResult[],
  dirtyStart: boolean,
): string | undefined => {
  const failed = results.find(({ exitCode }) => exitCode !== 0);

  return failed !== undefined
    ? `${failed.title} exited with ${failed.exitCode}.`
    : dirtyStart
      ? 'The tree was changed before the first step ran, by the setup or `pnpm install`.'
      : undefined;
};

/**
 * The annotation a job that failed for more than a diff
 * ({@link commandFailureOf}) leaves on its check run. `unblock-prs` declines an
 * auto-fix by it (`notFixableAnnotation` in `.github/unblock-prs.json`, which
 * has to say the same; `ci-job.test.mts` holds them equal), since one step runs
 * the build, the command and the clean-tree check, and which of them failed
 * cannot be read from the steps.
 *
 * A notice rather than an error: GitHub keeps ten of each per step, and the
 * problem matchers `actions/setup-node` registers can spend the errors on a
 * failing lint before this is printed last.
 */
export const commandFailedAnnotation = (failure: string): string =>
  `::notice title=${COMMAND_FAILED_ANNOTATION}::${failure.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A')}` as const;

/**
 * Of the files the steps wrote, those whose diff is the steps' alone, and those
 * changed before the first step too, whose diff from the index would show edits
 * that were already on the tree (a local run's, or an earlier `check-all`
 * entry's) as the steps' own.
 */
export const writesToShow = ({
  written,
  changedAtStart,
}: Readonly<{
  written: readonly string[];
  changedAtStart: ReadonlyMap<string, string>;
}>): Readonly<{
  shown: readonly string[];
  alreadyChanged: readonly string[];
}> =>
  ({
    shown: written.filter((file) => !changedAtStart.has(file)),
    alreadyChanged: written.filter((file) => changedAtStart.has(file)),
  }) as const;

/**
 * The `git` invocations that print what the steps wrote: one `git diff` per
 * batch of tracked files, with literal pathspecs so that thousands of rewritten
 * files stay under the argument limit, and a `git diff --no-index` from nothing
 * for each of the first {@link NEW_FILES_SHOWN} new files, which `git diff`
 * alone would leave out (`z:assert-repo-is-clean` showed them by `git add -N`
 * first; this leaves the index alone). The new files past those are named, not
 * shown, so that a generator writing a directory of them does not bury the
 * failure under their content.
 */
export const diffInvocations = ({
  files,
  untracked,
}: Readonly<{
  files: readonly string[];
  untracked: ReadonlySet<string>;
}>): Readonly<{
  invocations: readonly (readonly string[])[];
  newFilesNotShown: readonly string[];
}> => {
  const newFiles = files.filter((file) => untracked.has(file));

  return {
    invocations: [
      ...Arr.partition(
        files.filter((file) => !untracked.has(file)),
        DIFF_BATCH,
      ).map((batch) => [...DIFF_ARGS, '--', ...batch]),
      ...newFiles
        .slice(0, NEW_FILES_SHOWN)
        .map((file) => [...DIFF_ARGS, '--no-index', '--', '/dev/null', file]),
    ],
    newFilesNotShown: newFiles.slice(NEW_FILES_SHOWN),
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
  /** {@link commandFailureOf}, of the steps. */
  commandFailure: string | undefined;
  /** The paths the steps changed, together. */
  wrote: readonly string[];
}>;

export type StepResult = Readonly<{
  title: string;
  exitCode: number;
  /** The paths the step changed. */
  wrote: readonly string[];
}>;

export const COMMAND_FAILED_ANNOTATION = 'command failed';

const DIFF_BATCH = asPositiveUint32(500);

const NEW_FILES_SHOWN = 20;

const DIFF_ARGS = [
  '--no-pager',
  '--literal-pathspecs',
  'diff',
  '--no-ext-diff',
  '--no-color',
] as const;

/** `git diff --no-index` exits 1 when the two sides differ, as a new file does. */
const DIFFERENCES_FOUND = 1;

const USAGE =
  'Usage: pnpm run z:ci-job [--build <root script>] --command <root script>';

/**
 * Runs each `git diff` in turn, its output going straight to the log, and
 * returns the index of the first that failed, or -1. One at a time, so the
 * diffs do not interleave.
 */
const firstFailedDiff = async (
  invocations: readonly (readonly string[])[],
): Promise<number> => {
  for (const [index, args] of invocations.entries()) {
    const result = await runInherited('git', args, { cwd: projectRootPath });

    const failed =
      result.error !== undefined ||
      (result.status !== 0 && result.status !== DIFFERENCES_FOUND);

    if (failed) {
      console.error(
        `git diff of the changed files failed: ${unknownToString(result.error ?? result.signal ?? result.status)}`,
      );

      return index;
    }
  }

  return -1;
};

/**
 * Prints the diffs of `files`; the files whose diff it did not show, the new
 * ones past the first few, and every one a failed git left out.
 */
const printDiffs = async (
  files: readonly string[],
): Promise<readonly string[]> => {
  if (Arr.isEmpty(files)) {
    return [];
  }

  const untracked = await Result.fromPromise(
    Promise.all(
      Arr.partition(files, DIFF_BATCH).map(async (batch) =>
        splitZ(
          await git([
            '--literal-pathspecs',
            'ls-files',
            '--others',
            '--exclude-standard',
            '-z',
            '--',
            ...batch,
          ]),
        ),
      ),
    ).then((batches) => new Set<string>(batches.flat())),
  );

  if (Result.isErr(untracked)) {
    console.error(
      `git ls-files of the changed files failed: ${unknownToString(untracked.value)}`,
    );

    return files;
  }

  const { invocations, newFilesNotShown } = diffInvocations({
    files,
    untracked: untracked.value,
  });

  const failedAt = await firstFailedDiff(invocations);

  // Every invocation ends in its files, after the `--`.
  return failedAt === -1
    ? newFilesNotShown
    : [
        ...invocations
          .slice(failedAt)
          .flatMap((args) => args.slice(args.indexOf('--') + 1))
          .filter((file) => file !== '/dev/null'),
        ...newFilesNotShown,
      ];
};

/**
 * What a step wanted the files it changed to hold, as `z:assert-repo-is-clean`
 * printed it, new files' content included ({@link diffInvocations}); and the
 * names of the files whose diff is not shown, the new ones past those and the
 * ones whose diff would not be the steps' alone ({@link writesToShow}). A git
 * that fails here is reported and the diff left out, the names still listed:
 * the job's verdict does not depend on it.
 */
const printWrites = async ({
  shown,
  alreadyChanged,
}: ReturnType<typeof writesToShow>): Promise<void> => {
  const notShown = await printDiffs(shown);

  for (const [heading, files] of [
    [
      `And ${plural(notShown.length, 'more file')} whose diff is not shown:`,
      notShown,
    ],
    [
      'Changed before the first step too, so their diff is not shown (it would hold the edits already there):',
      alreadyChanged,
    ],
  ] as const) {
    if (Arr.isNonEmpty(files)) {
      console.info(
        Arr.toUnshifted(heading)(files.map((file) => `  ${file}`)).join('\n'),
      );
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

      if (
        outcome.commandFailure !== undefined &&
        process.env['GITHUB_ACTIONS'] === 'true'
      ) {
        console.info(commandFailedAnnotation(outcome.commandFailure));
      }
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
