import * as fs from 'node:fs/promises';
import * as util from 'node:util';
import { Arr, asPositiveUint32, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { runInherited } from '../lib/child-process.mjs';
import { plural } from '../lib/plural.mjs';
import {
  diffSnapshots,
  git,
  isRegularFile,
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

  await printWrites(
    writesToShow({
      written: wrote,
      changedAtStart: initial,
      cleanStart: requireCleanStart,
    }),
  );

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
 * entry's) as the steps' own. On a checkout that started clean (CI's,
 * `cleanStart`) every write is shown: a file changed before the first step was
 * changed by the setup or `pnpm install`, which the job fails for anyway, and
 * its diff from the index is exactly what they and the steps wrote.
 */
export const writesToShow = ({
  written,
  changedAtStart,
  cleanStart,
}: Readonly<{
  written: readonly string[];
  changedAtStart: ReadonlyMap<string, string>;
  cleanStart: boolean;
}>): Readonly<{
  shown: readonly string[];
  alreadyChanged: readonly string[];
}> =>
  cleanStart
    ? ({ shown: written, alreadyChanged: [] } as const)
    : ({
        shown: written.filter((file) => !changedAtStart.has(file)),
        alreadyChanged: written.filter((file) => changedAtStart.has(file)),
      } as const);

/**
 * The `git` invocations that print what the steps wrote: one `git diff` per
 * batch of tracked files, with literal pathspecs so that thousands of rewritten
 * files stay under the argument limit, and a `git diff --no-index` from nothing
 * for each of the first {@link NEW_FILES_SHOWN} new files, which `git diff`
 * alone would leave out (`z:assert-repo-is-clean` showed them by `git add -N`
 * first; this leaves the index alone). The new files past those are named, not
 * shown, so that a generator writing a directory of them does not bury the
 * failure under their content; so is a new path that is not a regular file (the
 * `dir/` of an untracked nested repository), which `git diff --no-index` cannot
 * read and answers with the same exit code 1 as a difference.
 */
export const diffInvocations = ({
  files,
  untracked,
  isFile,
}: Readonly<{
  files: readonly string[];
  untracked: ReadonlySet<string>;
  /** Whether a path is a regular file now. */
  isFile: (file: string) => boolean;
}>): Readonly<{
  invocations: readonly (readonly string[])[];
  newFilesNotShown: readonly string[];
}> => {
  const newFiles = files.filter((file) => untracked.has(file));

  // The first regular files, without asking about the rest: a generator can
  // write thousands. A regular file git still cannot read (no read permission,
  // or removed after the stat) gets exit code 1 too and counts as shown, and a
  // path a step created and a later one removed lands in a tracked batch that
  // prints nothing for it, as does a tracked file a later step put back as the
  // index has it; none of them is named below, and the job's failure names
  // every path the steps wrote whatever is shown here.
  const shownNew = new Set<string>(
    Iterator.from(newFiles).filter(isFile).take(NEW_FILES_SHOWN),
  );

  return {
    invocations: [
      ...Arr.partition(
        files.filter((file) => !untracked.has(file)),
        DIFF_BATCH,
      ).map((batch) => [...DIFF_ARGS, '--', ...batch]),
      ...Array.from(shownNew, (file) => [
        ...DIFF_ARGS,
        '--no-index',
        '--',
        '/dev/null',
        file,
      ]),
    ],
    newFilesNotShown: newFiles.filter((file) => !shownNew.has(file)),
  };
};

/**
 * The files whose diff was not shown: those of every invocation that failed
 * (each ends in its files, after the `--`), wherever it stood among the others,
 * which still ran, and then the new files not diffed at all.
 */
export const filesNotShown = ({
  invocations,
  outcomes,
  newFilesNotShown,
}: Readonly<{
  invocations: readonly (readonly string[])[];
  /** What each invocation did, by index. */
  outcomes: readonly DiffOutcome[];
  newFilesNotShown: readonly string[];
}>): readonly string[] =>
  [
    ...invocations
      .filter((_, index) => outcomes[index] === 'failed')
      .flatMap(pathsOf),
    ...newFilesNotShown,
  ] as const;

/**
 * The paths an invocation diffs: those after its `--`, `/dev/null` aside.
 * Every invocation {@link diffInvocations} builds has its `--` before the first
 * path, so a path named `--` is a path here.
 */
export const pathsOf = (args: readonly string[]): readonly string[] =>
  args.slice(args.indexOf('--') + 1).filter((file) => file !== '/dev/null');

/**
 * The heading over the files whose diff is not shown: "more" only when some
 * diff was shown above it.
 */
export const notShownHeading = (count: number, anyShown: boolean): string =>
  anyShown
    ? (`And ${plural(count, 'more file')} whose diff is not shown:` as const)
    : (`${plural(count, 'file')} whose diff is not shown:` as const);

/**
 * What a `git diff --exit-code` did ({@link DIFF_ARGS}): printed a diff (exit
 * 1), printed nothing (exit 0), or failed to run or exited otherwise.
 */
export const diffOutcome = (
  result: Readonly<{ status: number | null; error?: unknown }>,
): DiffOutcome =>
  result.error !== undefined
    ? 'failed'
    : result.status === DIFFERENCES_FOUND
      ? 'shown'
      : result.status === 0
        ? 'empty'
        : 'failed';

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

export type DiffOutcome = 'shown' | 'empty' | 'failed';

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
  '--exit-code',
  '--no-ext-diff',
  '--no-color',
] as const;

/**
 * `git diff --exit-code` (which `--no-index` implies) exits 1 when it printed a
 * difference, as a new file has, and 0 when it printed nothing. `--no-index`
 * exits 1 too on a path it cannot read (see {@link diffInvocations}).
 */
const DIFFERENCES_FOUND = 1;

const USAGE =
  'Usage: pnpm run z:ci-job [--build <root script>] --command <root script>';

/**
 * Runs each `git diff` in turn, its output going straight to the log, and
 * returns what each did ({@link diffOutcome}). One at a time, so the diffs do
 * not interleave; every one, so that one that fails hides no other's diff.
 */
const runDiffs = async (
  invocations: readonly (readonly string[])[],
): Promise<readonly DiffOutcome[]> => {
  const mut_outcomes: DiffOutcome[] = [];

  for (const [index, args] of invocations.entries()) {
    const result = await runInherited('git', args, { cwd: projectRootPath });

    const outcome = diffOutcome(result);

    mut_outcomes.push(outcome);

    if (outcome === 'failed') {
      console.error(
        `git diff invocation ${index + 1} of ${invocations.length} (${plural(pathsOf(args).length, 'path')}) failed: ${unknownToString(result.error ?? result.signal ?? result.status)}`,
      );
    }
  }

  return mut_outcomes;
};

/**
 * Prints the diffs of `files`; the files whose diff it did not show, the new
 * ones past the first few or not regular files, and every one a failed git left
 * out; and whether any diff was shown.
 */
const printDiffs = async (
  files: readonly string[],
): Promise<Readonly<{ notShown: readonly string[]; anyShown: boolean }>> => {
  if (Arr.isEmpty(files)) {
    return { notShown: [], anyShown: false };
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

    return { notShown: files, anyShown: false };
  }

  const { invocations, newFilesNotShown } = diffInvocations({
    files,
    untracked: untracked.value,
    isFile: isRegularFile,
  });

  const outcomes = await runDiffs(invocations);

  return {
    notShown: filesNotShown({ invocations, outcomes, newFilesNotShown }),
    anyShown: outcomes.includes('shown'),
  };
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
  const { notShown, anyShown } = await printDiffs(shown);

  for (const [heading, files] of [
    [notShownHeading(notShown.length, anyShown), notShown],
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
