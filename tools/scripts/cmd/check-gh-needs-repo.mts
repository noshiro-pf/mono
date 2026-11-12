import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { plural } from '../lib/plural.mjs';
import {
  listActionFiles,
  listWorkflowFiles,
  readRepositoryFile,
} from '../lib/repo-files.mjs';
import { readShellCommands } from '../lib/shell-commands.mjs';
import {
  readCompositeActionSteps,
  readWorkflowJobs,
  type WorkflowStep,
} from '../lib/workflow-jobs.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a step runs a `gh` command that takes its repository from `git`
 * with nothing to give it one: no `GH_REPO` in the step's, job's or workflow's
 * `env:`, no `--repo` (`-R`) on the call, and no checkout of this repository as
 * its job's first step.
 *
 * Such a call stops with "not a git repository" — and in a job that runs only
 * when something has gone wrong, such as a report of a failed scheduled run,
 * that is the one moment nobody is watching for it. `gh api` names its path
 * itself and needs none, unless it uses the `{owner}` or `{repo}` placeholders
 * (or `:owner`, `:repo`) in its endpoint or an `-F` field, which `gh` fills
 * from `GH_REPO` or `git` alone: it takes no `--repo`. A `{branch}` in a `bash`
 * or `sh` script is reported whatever is given, since `gh` fills it from the
 * checked-out branch alone, which a checkout of a pull request or a commit
 * leaves detached.
 *
 * **A checkout counts only as the job's first step**, with no `if:`, no `path:`
 * and no `repository:`, and only for a step before any later checkout (which
 * may put another repository in its place) and with no `working-directory` that
 * may lead out of it. Where a checkout comes later, whether it ran before a
 * given step depends on what failed or was cancelled and on each step's `if:`,
 * which this does not evaluate; a step it does serve is told to set `GH_REPO`,
 * which costs nothing. A checkout that itself fails is counted all the same: a
 * job whose checkout fails is broken whatever its `gh` calls are given. None
 * counts in a job with a `container:`, where a checkout without git leaves no
 * `.git`.
 *
 * The workflows under `.github/workflows/` are read, and the actions under
 * `.github/actions/`, of which a composite one has steps to read. No checkout
 * counts there: its steps run in whatever job calls it, and a checkout of its
 * own may be skipped by the caller's state.
 *
 * The reading leans to reporting, because `GH_REPO` in the step's `env:`
 * answers every report. A call is judged by its noun alone, so one that names
 * its repository in an argument (`gh repo clone o/r`, `gh issue view <url>`) is
 * reported too. `GH_REPO` set by the script is not read: before the call on its
 * line (`GH_REPO=o/r gh …`, `env GH_REPO=o/r gh …`) the shell reader drops it,
 * and whether an `export` reaches the call depends on subshells, `unset` and
 * the order of assignments, which it does not follow; nor is one written to
 * `$GITHUB_ENV` by an earlier step.
 *
 * A step whose `shell` is not `bash` or `sh` is not parsed: one whose script
 * has the word `gh` anywhere is taken for one call that reads the repository,
 * which only `GH_REPO` or a checkout answers; no `{branch}` is looked for in
 * it. A step with no `shell` is read as `bash`, which it is on a Linux runner;
 * on a Windows one it is `pwsh`.
 *
 * What it does not see in a shell script: a `gh` run through a wrapper the
 * shell reader does not unwrap (`xargs gh …`, `sudo gh …`, `/usr/bin/env gh
 * …`; it does unwrap `env`, `timeout` and the like), and a move out of the
 * checkout inside the script (`cd`, `env -C`).
 */
export const checkGhNeedsRepo = (): Promise<Result<CheckSummary, string>> =>
  Result.safeTry(async function* () {
    const workflowPaths = yield* Result.safeUnwrap(await listWorkflowFiles());

    const actionPaths = yield* Result.safeUnwrap(await listActionFiles());

    const reports = await Promise.all([
      ...workflowPaths.map((file) => readReport(file, findGhCallsWithoutRepo)),
      ...actionPaths.map((file) =>
        readReport(file, findCompositeGhCallsWithoutRepo),
      ),
    ]);

    const unreadable = reports.filter(Result.isErr).map(({ value }) => value);

    if (Arr.isNonEmpty(unreadable)) {
      return Result.err(unreadable.join('\n'));
    }

    const read = reports.filter(Result.isOk).map(({ value }) => value);

    const violations = read.flatMap((report) => report.violations);

    if (Arr.isNonEmpty(violations)) {
      return Result.err(formatViolations(violations));
    }

    return Result.ok({
      files: read.length,
      calls: read.reduce((total, report) => total + report.calls, 0),
    });
  });

/**
 * The `gh` calls in one workflow that read their repository from `git` with
 * nothing to give it one, each as `<job>: <step>: <command>`, and how many such
 * calls there are in all, given one or not.
 */
export const findGhCallsWithoutRepo = (
  workflowText: string,
): Result<GhCallReport, string> =>
  Result.flatMap(
    readWorkflowJobs(workflowText),
    (jobs): Result<GhCallReport, string> =>
      judgeSteps(
        jobs.map((job) => ({
          // In a container without git a checkout downloads a tarball and
          // leaves no `.git`, so none counts there.
          countCheckout: !job.hasContainer,
          steps: job.steps.map((step) => ({
            ...step,
            where: `${job.name}: ${step.name ?? '(unnamed step)'}`,
            env: { ...job.env, ...step.env },
          })),
        })),
      ),
  );

/**
 * {@link findGhCallsWithoutRepo} for a composite action's `runs.steps`, each as
 * `<step>: <command>`. No checkout counts, its caller's or its own, and only
 * its step's own `env:` gives `GH_REPO`: what its callers set is not in the
 * file, and an action that needs it should not depend on each caller.
 */
export const findCompositeGhCallsWithoutRepo = (
  actionText: string,
): Result<GhCallReport, string> =>
  Result.flatMap(
    readCompositeActionSteps(actionText),
    (steps): Result<GhCallReport, string> =>
      judgeSteps([
        {
          countCheckout: false,
          steps: steps.map((step) => ({
            ...step,
            where: step.name ?? '(unnamed step)',
          })),
        },
      ]),
  );

/**
 * Whether a command is a `gh` command that takes its repository from `git` (or
 * `GH_REPO`, or `--repo`) when it is given none.
 */
export const readsRepoFromGit = (command: readonly string[]): boolean => {
  // By name or by path (`/usr/bin/gh`).
  if (command[0] === undefined || path.posix.basename(command[0]) !== 'gh') {
    return false;
  }

  const subcommand = command[1];

  return subcommand === 'api'
    ? apiPlaceholders(command).some((word) => API_PLACEHOLDER.test(word))
    : subcommand !== undefined && REPO_SUBCOMMANDS.has(subcommand);
};

type GhCallReport = Readonly<{ violations: readonly string[]; calls: number }>;

type CheckSummary = Readonly<{ files: number; calls: number }>;

type StepToJudge = WorkflowStep & Readonly<{ where: string }>;

/**
 * The `gh` commands that act on "the current repository", which `gh` finds from
 * `GH_REPO`, `--repo`, or else the `git` remote of the working directory.
 */
const REPO_SUBCOMMANDS: ReadonlySet<string> = new Set<string>([
  'agent-task',
  'browse',
  // The built-in alias of `pr checkout`.
  'co',
  'cache',
  'issue',
  'label',
  'pr',
  'release',
  'repo',
  'ruleset',
  'run',
  'secret',
  'variable',
  'workflow',
]);

/** The placeholders `gh api` fills from the current repository. */
const API_PLACEHOLDER = /\{(?:owner|repo|branch)\}|:(?:owner|repo|branch)\b/u;

/**
 * The `{branch}` placeholder, which `gh` fills from the checked-out branch
 * alone: not from `GH_REPO`, and not on the detached `HEAD` a checkout of a
 * pull request or a commit leaves.
 */
const BRANCH_PLACEHOLDER = /\{branch\}|:branch\b/u;

/**
 * The flags of `gh api` whose value is not filled: everything but the endpoint
 * and the `-F` / `--field` values, which are.
 */
const API_UNFILLED_FLAGS: ReadonlySet<string> = new Set<string>([
  '--cache',
  '--header',
  '--hostname',
  '--input',
  '--jq',
  '--method',
  '--preview',
  '--raw-field',
  '--template',
  '-H',
  '-X',
  '-f',
  '-p',
  '-q',
  '-t',
]);

/**
 * The words of a `gh api` call that `gh` fills placeholders in: its endpoint
 * and its `-F` / `--field` values, and none of the other flags' values (a jq
 * filter's `{repo}` is jq's).
 */
const apiPlaceholders = (command: readonly string[]): readonly string[] =>
  Arr.skip(command, 2).filter(
    (word, index, words) =>
      !API_UNFILLED_FLAGS.has(words[index - 1] ?? '') &&
      (!word.startsWith('-') || /^(?:-F|--field(?:=|$))/u.test(word)) &&
      !API_UNFILLED_FLAGS.has(word.split('=', 1)[0] ?? ''),
  );

/** Whether a `gh api` call uses {@link BRANCH_PLACEHOLDER}. */
const usesBranchPlaceholder = (command: readonly string[]): boolean =>
  command[1] === 'api' &&
  apiPlaceholders(command).some((word) => BRANCH_PLACEHOLDER.test(word));

const usesCheckout = (step: StepToJudge): boolean =>
  step.uses?.startsWith('actions/checkout@') === true;

const isCheckout = (step: StepToJudge): boolean =>
  usesCheckout(step) &&
  step.condition === undefined &&
  step.with['repository'] === undefined &&
  step.with['path'] === undefined;

/**
 * Whether a step runs inside the checkout: in the workspace, or in a directory
 * of it. An absolute path, a `..` or an expression (`\${{ runner.temp }}`) may
 * lead out of it, and is not counted.
 */
const runsInCheckout = (step: StepToJudge): boolean =>
  step.workingDirectory === undefined ||
  !(
    step.workingDirectory.startsWith('/') ||
    step.workingDirectory.startsWith('~') ||
    step.workingDirectory.split('/').includes('..') ||
    step.workingDirectory.includes('${{')
  );

/**
 * Whether a `shell` is one whose script the shell reader reads: `bash` or `sh`,
 * by name or by path, with or without a template (`/usr/bin/bash -e {0}`). A
 * step that gives none runs `bash` on a Linux runner.
 */
const isPosixShell = (shell: string): boolean =>
  ['bash', 'sh'].includes(
    path.posix.basename(shell.trim().split(/\s/u, 1)[0] ?? ''),
  );

/**
 * Whether a script in another language (`pwsh`, `python`), which is not read,
 * may run `gh`: the word `gh` anywhere in it, a URL or a comment included.
 *
 * Case matters, as it does for the command on a Linux runner: matched without
 * it, a constant or prose (`GH = …`, `"GH Actions"`) would read as a call. A
 * `GH` that Windows resolves to `gh` is outside what this reads, as is a step
 * with no `shell` there (see the header).
 */
const mentionsGh = (script: string): boolean =>
  /(?:^|[^\w-])gh(?:[^\w-]|$)/mu.test(script);

/**
 * Whether the call names its repository. `gh api` takes no `--repo`, so on it
 * the flag answers nothing (`gh` refuses it as an unknown flag). A word is
 * taken as a flag where it stands: the values of other flags are not parsed, so
 * `--body -R --label x` reads as naming one.
 */
const namesRepo = (command: readonly string[]): boolean =>
  command[1] !== 'api' &&
  command.some(
    (word, index) =>
      ((word === '--repo' || word === '-R') &&
        command[index + 1] !== undefined) ||
      /^--repo=./u.test(word) ||
      // `-Ro/r` or `-R$REPO`; not a value that only starts with `-R`.
      /^-R(?:\$|[\w.-]+\/)/u.test(word),
  );

/**
 * The calls each job's steps make (a composite action's steps are one job),
 * each judged as the header says; with `countCheckout`, a checkout as the job's
 * first step serves the steps after it.
 */
const judgeSteps = (
  jobs: readonly Readonly<{
    countCheckout: boolean;
    steps: readonly StepToJudge[];
  }>[],
): Result<GhCallReport, string> => {
  const readings = jobs.flatMap(({ countCheckout, steps }) => {
    const checkedOut =
      countCheckout && steps[0] !== undefined && isCheckout(steps[0]);

    // A later checkout may put another repository, or none, in its place;
    // even one into a `path:` holds a repository a step may run in, so the
    // first serves no step after any.
    const secondCheckout = steps.findIndex(
      (step, index) => index > 0 && usesCheckout(step),
    );

    return steps.flatMap((step, index) => {
      if (step.run === undefined) {
        return [];
      }

      const { where, env } = step;

      const servedByCheckout =
        checkedOut &&
        index > 0 &&
        (secondCheckout === -1 || index < secondCheckout) &&
        runsInCheckout(step);

      const hasGhRepo = (env['GH_REPO'] ?? '') !== '';

      // A script in another language is not read: one that may run `gh` is
      // taken for one call, which only `GH_REPO` or the checkout answers. No
      // `{branch}` is looked for in it: no pattern tells `gh`'s placeholder
      // from the language's own syntax (`$env:branch`, a Python f-string) or
      // follows a call across lines, so this reads it only as far as whether
      // `gh` runs at all.
      if (step.shell !== undefined && !isPosixShell(step.shell)) {
        return mentionsGh(step.run)
          ? [
              {
                problems: [],
                calls: [
                  {
                    where,
                    command: [`(a \`${step.shell}\` script that runs gh)`],
                    given: servedByCheckout || hasGhRepo,
                  },
                ],
              },
            ]
          : [];
      }

      const reading = readShellCommands(step.run);

      return [
        {
          problems: reading.problems.map((problem) => `${where}: ${problem}`),
          calls: reading.commands.filter(readsRepoFromGit).map((command) => ({
            where,
            command,
            given:
              !usesBranchPlaceholder(command) &&
              (servedByCheckout || hasGhRepo || namesRepo(command)),
          })),
        },
      ];
    });
  });

  const problems = readings.flatMap((reading) => reading.problems);

  if (Arr.isNonEmpty(problems)) {
    return Result.err(
      `a \`run:\` script this cannot read: ${problems.join('; ')}`,
    );
  }

  const calls = readings.flatMap((reading) => reading.calls);

  return Result.ok({
    violations: calls
      .filter(({ given }) => !given)
      .map(({ where, command }) => `${where}: ${command.join(' ')}`),
    calls: calls.length,
  });
};

/** What `find` makes of the file at `absolutePath`, its paths the repository's. */
const readReport = async (
  absolutePath: string,
  find: (source: string) => Result<GhCallReport, string>,
): Promise<Result<GhCallReport, string>> => {
  const relativePath = path.relative(projectRootPath, absolutePath);

  const text = await readRepositoryFile(relativePath);

  if (Result.isErr(text)) {
    return Result.err(`❌ ${text.value}`);
  }

  return Result.fold(
    find(text.value),
    ({ violations, calls }) => ({
      violations: violations.map(
        (violation) => `${relativePath}: ${violation}`,
      ),
      calls,
    }),
    (message) => `❌ ${relativePath}: ${message}`,
  );
};

const formatViolations = (violations: readonly string[]): string =>
  [
    '❌ These `gh` calls take their repository from `git`, and nothing gives them one:',
    '',
    ...violations.map((violation) => `  ${violation}`),
    '',
    'With no checkout of this repository where the step runs, `gh` stops with',
    '"not a git repository". A checkout counts only as the job\'s first step,',
    'with no `if:`, `path:` or `repository:`, for a step before any later',
    'checkout and whose `working-directory` stays inside it; none counts in a',
    'job with a `container:` or in a composite action.',
    '`GH_REPO` set by the script is not read. A `{branch}` placeholder in a',
    '`bash` or `sh` script is reported whatever is given, since only a',
    'checked-out branch fills it: write the branch out.',
    // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
    "Set `GH_REPO: ${{ github.repository }}` in the step's `env:`, or pass",
    '`--repo "$GITHUB_REPOSITORY"` on the call (`gh api`, and a script in',
    'another language, take `GH_REPO` only).',
    'A checkout only to answer this clones the repository for a name the event',
    'already carries.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkGhNeedsRepo().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `Every \`gh\` call that reads the current repository is given one (${plural(result.value.calls, 'call')} across ${plural(result.value.files, 'workflow and action file')}).`,
  );
}
