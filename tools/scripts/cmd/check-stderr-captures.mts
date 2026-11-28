import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import {
  listActionFiles,
  listWorkflowFiles,
  readRepositoryFile,
} from '../lib/repo-files.mjs';
import { readShellScript } from '../lib/shell-commands.mjs';
import {
  readCompositeActionSteps,
  readWorkflowJobs,
  type WorkflowStep,
} from '../lib/workflow-jobs.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a `run:` script of a workflow or composite action captures a
 * command's output with its stderr merged in (`x="$(gh api … 2>&1)"`): a
 * warning the command writes on success becomes part of the value the script
 * then parses (#4133, #4359). The rule and the shape to write instead are in
 * `.github/workflows/README.md`, "Adding or changing a workflow".
 *
 * A command inside a command substitution (`$(…)` or backticks) is reported
 * when, after its redirections in order, both its stdout and its stderr end in
 * the capture (`2>&1`, `2>/dev/stdout`, `|&`). `$(cmd 2>&1 >/dev/null)`, which
 * captures stderr alone, is not reported, nor is `>/dev/null 2>&1`, which
 * captures nothing. A step whose shell is not `bash` or `sh` is not read (one
 * with none is `bash` on a Linux runner); what the shell reader cannot read is
 * reported as it is. A redirection of a whole subshell or group inside a
 * capture (`$( (a; b) 2>&1 )`) belongs to no simple command, which is what the
 * reader keeps redirections for, and is not reported.
 */
export const checkStderrCaptures = (): Promise<Result<number, string>> =>
  Result.safeTry(async function* () {
    const workflowPaths = yield* Result.safeUnwrap(await listWorkflowFiles());

    const actionPaths = yield* Result.safeUnwrap(await listActionFiles());

    const reports = await Promise.all([
      ...workflowPaths.map((file) => readReport(file, findStderrCaptures)),
      ...actionPaths.map((file) =>
        readReport(file, findCompositeStderrCaptures),
      ),
    ]);

    const unreadable = reports.filter(Result.isErr).map(({ value }) => value);

    if (Arr.isNonEmpty(unreadable)) {
      return Result.err(unreadable.join('\n'));
    }

    const found = reports.filter(Result.isOk).flatMap(({ value }) => value);

    return Arr.isNonEmpty(found)
      ? Result.err(
          [
            `❌ ${found.length} capture(s) with stderr merged into what the script reads:`,
            '',
            ...found.map((report) => `  ${report}`),
            '',
            'Capture stdout alone and send stderr to a file the error message reads:',
            '  if ! x="$(gh api … 2>"$errors")"; then fail "…: $(<"$errors")"; fi',
            '(.github/workflows/README.md, "Adding or changing a workflow").',
          ].join('\n'),
        )
      : Result.ok(reports.length);
  });

/** The captures with stderr merged in, of one workflow, as `<job>: <step>: …`. */
export const findStderrCaptures = (
  workflowText: string,
): Result<readonly string[], string> =>
  Result.map(readWorkflowJobs(workflowText), (jobs) =>
    jobs.flatMap((job) =>
      job.steps.flatMap((step) =>
        stepReports(step).map(
          (report) =>
            `${job.name}: ${step.name ?? '(unnamed step)'}: ${report}`,
        ),
      ),
    ),
  );

/** {@link findStderrCaptures} for a composite action, as `<step>: …`. */
export const findCompositeStderrCaptures = (
  actionText: string,
): Result<readonly string[], string> =>
  Result.map(readCompositeActionSteps(actionText), (steps) =>
    steps.flatMap((step) =>
      stepReports(step).map(
        (report) => `${step.name ?? '(unnamed step)'}: ${report}`,
      ),
    ),
  );

/**
 * Whether a command's stdout and stderr both end in the capture its output goes
 * to, after `redirections` in order (as the shell reader keeps them).
 */
export const mergesStderrIntoCapture = (
  redirections: readonly string[],
): boolean => {
  const { out, err } = redirections.reduce<Targets>(redirect, {
    out: 'capture',
    err: 'stderr',
  });

  return out === 'capture' && err === 'capture';
};

/** Where a command's stdout and stderr go. */
type Targets = Readonly<{ out: string; err: string }>;

/** Where they go after `redirection`, from `targets`. */
const redirect = (targets: Targets, redirection: string): Targets => {
  if (redirection === '|&') {
    return { ...targets, err: targets.out };
  }

  const parsed = REDIRECTION.exec(redirection)?.groups;

  if (parsed === undefined) {
    return targets;
  }

  const { descriptor = '', both = '', operator = '', target = '' } = parsed;

  if (operator.startsWith('<')) {
    return targets;
  }

  const duplicates = operator.endsWith('&') && DIGITS.test(target);

  // `&>file`, `>&file`: both to the file; `>&-` closes stdout.
  if (both === '&' || (!duplicates && operator.endsWith('&'))) {
    return target === '-' ? targets : { out: 'file', err: 'file' };
  }

  const where = duplicates
    ? target === '1'
      ? targets.out
      : target === '2'
        ? targets.err
        : 'file'
    : target === '/dev/stdout'
      ? targets.out
      : target === '/dev/stderr'
        ? targets.err
        : 'file';

  return descriptor === '' || descriptor === '1'
    ? { ...targets, out: where }
    : descriptor === '2'
      ? { ...targets, err: where }
      : targets;
};

/** The reports of one step: each capture with stderr merged in, or why it cannot be read. */
const stepReports = (step: WorkflowStep): readonly string[] => {
  if (
    step.run === undefined ||
    (step.shell !== undefined && !SHELLS.has(step.shell))
  ) {
    return [];
  }

  const { commands, details, problems } = readShellScript(step.run);

  if (Arr.isNonEmpty(problems)) {
    return problems.map(
      (problem) =>
        `the script cannot be read (${problem}), so its captures are not checked`,
    );
  }

  return Arr.generate(function* () {
    for (const [words, detail] of Arr.zip(commands, details)) {
      if (
        detail.inSubstitution &&
        mergesStderrIntoCapture(detail.redirections)
      ) {
        yield `\`${words.join(' ')}\` merges stderr into a $(…) capture (${detail.redirections.join(' ')})`;
      }
    }
  });
};

const readReport = async (
  absolutePath: string,
  find: (source: string) => Result<readonly string[], string>,
): Promise<Result<readonly string[], string>> => {
  const relativePath = path.relative(projectRootPath, absolutePath);

  const text = await readRepositoryFile(relativePath);

  if (Result.isErr(text)) {
    return Result.err(`❌ ${text.value}`);
  }

  return Result.fold(
    find(text.value),
    (reports) => reports.map((report) => `${relativePath}: ${report}`),
    (message) => `❌ ${relativePath}: ${message}`,
  );
};

/** The shells whose scripts are read. */
const SHELLS: ReadonlySet<string> = new Set<string>(['bash', 'sh']);

/** A redirection as the shell reader keeps it. */
const REDIRECTION =
  /^(?<descriptor>\d*)(?<both>&?)(?<operator>>>?&?|<<<|<&?|<>)(?<target>.*)$/su;

const DIGITS = /^\d+$/u;

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkStderrCaptures().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} workflow(s) and action(s) read; no script captures a command's stderr with its output.`,
  );
}
