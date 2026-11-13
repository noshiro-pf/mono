import * as fs from 'node:fs/promises';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import {
  CI_JOB,
  CI_JOB_BUILD,
  CI_JOB_COMMAND,
} from '../lib/ci-job-options.mjs';
import {
  optionValues,
  readPnpmRun,
  type PnpmRun,
} from '../lib/pnpm-command.mjs';
import { listWorkflowFiles } from '../lib/repo-files.mjs';
import { readShellCommands } from '../lib/shell-commands.mjs';
import {
  expandVariable,
  matrixKeyOf,
  matrixValues,
  readMatrix,
  readWorkflowJobs,
  triggersOn,
  type WorkflowJob,
} from '../lib/workflow-jobs.mjs';
import { pathFromRoot } from '../project-root-path.mjs';
import { MATRIX_WORKFLOWS } from './check-all.mjs';

/**
 * Holds the check workflows to the shape that keeps a local run and CI in step:
 * a matrix entry runs through `z:ci-job` (build, entry, a clean-tree failure
 * that names its step), the job carries the step that says which of its
 * commands `check-changed` would have run (`z:check-changed-gap`), and
 * `check-all` reads exactly the workflows that do, so that it runs what they
 * run.
 *
 * Each of those can be undone by a workflow edit that fails nothing: a new
 * matrix job written as `pnpm run ${{ matrix.command }}` with its own
 * `z:assert-repo-is-clean` runs, passes, and is invisible to `check-all`. A
 * workflow that runs its entries bare for a reason of its own is declared in
 * {@link RAW_MATRIX_ALLOWED}, with the reason.
 */
export const checkCiJobShape = (): Promise<Result<number, string>> =>
  Result.safeTry(async function* () {
    const paths = yield* Result.safeUnwrap(await listWorkflowFiles());

    const workflows = await Promise.all(
      paths.map(async (workflowPath) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a workflow file listWorkflowFiles found.
        const text = await fs.readFile(workflowPath, 'utf8');

        return {
          relativePath: pathFromRoot(workflowPath),
          text,
          isCheck: triggersOn(text, 'pull_request'),
        };
      }),
    );

    const violations = findJobShapeViolations({
      workflows,
      checkAllWorkflows: MATRIX_WORKFLOWS,
      rawAllowed: RAW_MATRIX_ALLOWED,
    });

    return Arr.isNonEmpty(violations)
      ? Result.err(violations.join('\n\n'))
      : Result.ok(workflows.filter(({ isCheck }) => isCheck).length);
  });

/**
 * Every way the workflows have left the shape, one message each. A matrix job
 * (a job with a `matrix:` that runs entries) of a check workflow either runs
 * `z:ci-job`, and then carries the report and no clean-tree step of its own, or
 * runs its entries some other way, which its workflow has to be allowed to do.
 * Read job by job, through the YAML parser and the shell reader that
 * `check-ci-commands.mts` and `check-all.mts` read the workflows with, so that
 * one job's step answers for no other, a mention is not a run, and a run is a
 * run however the line is written (joined by `|` or `$(…)`, continued with `\`,
 * a matrix value handed on through a variable).
 */
export const findJobShapeViolations = ({
  workflows,
  checkAllWorkflows,
  rawAllowed,
}: Readonly<{
  /** Every workflow, with its text and whether a pull request runs it. */
  workflows: readonly Readonly<{
    relativePath: string;
    text: string;
    isCheck: boolean;
  }>[];
  /** `MATRIX_WORKFLOWS` of `check-all.mts`. */
  checkAllWorkflows: readonly string[];
  rawAllowed: readonly RawAllowance[];
}>): readonly string[] => {
  const read = workflows.map((workflow) => ({
    ...workflow,
    jobs: readWorkflowJobs(workflow.text),
  }));

  const unparsed = Arr.generate(function* () {
    for (const { relativePath, isCheck, jobs: parsed } of read) {
      if (isCheck && Result.isErr(parsed)) {
        yield `${relativePath}: ${parsed.value}`;
      }
    }
  });

  const jobs = read.flatMap(({ relativePath, isCheck, jobs: parsed }) =>
    (Result.isOk(parsed) ? parsed.value : [])
      .filter((job) => job.matrix !== undefined && runsEntries(job))
      .map((job) => ({
        relativePath,
        isCheck,
        label: `${relativePath} (job \`${job.name}\`)`,
        ...readJob(job),
      })),
  );

  const checkJobs = jobs.filter(({ isCheck }) => isCheck);

  const allowed = new Set<string>(
    rawAllowed.map(({ relativePath }) => relativePath),
  );

  const bareWorkflows = new Set<string>(
    checkJobs
      .filter(({ throughCiJob }) => !throughCiJob)
      .map(({ relativePath }) => relativePath),
  );

  const ciJobWorkflows = new Set<string>(
    checkJobs
      .filter(({ throughCiJob }) => throughCiJob)
      .map(({ relativePath }) => relativePath),
  );

  const nonCheck = new Set<string>(
    workflows
      .filter(({ isCheck }) => !isCheck)
      .map(({ relativePath }) => relativePath),
  );

  const checkAllSet = new Set<string>(checkAllWorkflows);

  return [
    ...unparsed,
    ...checkJobs.flatMap(
      ({
        relativePath,
        label,
        throughCiJob,
        alsoBare,
        unreadable,
        reports,
        assertsClean,
        problems,
      }) => [
        ...problems.map(
          (problem) =>
            `${label}: ${problem}. Write the step in a form this reads, so that what it runs is judged.`,
        ),
        ...(!throughCiJob && !allowed.has(relativePath)
          ? [
              `${label} runs its matrix entries without \`z:ci-job\`. Run each through \`pnpm run z:ci-job --build \${{ matrix.build }} --command \${{ matrix.command }}\`, so that a write names its step and \`check-all\` runs it too, or add the workflow to RAW_MATRIX_ALLOWED in check-ci-job-shape.mts with the reason.`,
            ]
          : []),
        ...(throughCiJob && alsoBare
          ? [
              `${label} runs a matrix entry with \`pnpm run \${{ matrix.<key> }}\` beside \`z:ci-job\`; run every entry through \`z:ci-job\`.`,
            ]
          : []),
        ...(throughCiJob && unreadable !== undefined
          ? [
              `${label} runs \`z:ci-job\` on a matrix \`check-all\` cannot read (${unreadable}): it reads the \`include:\` entries and their \`command\` and \`build\`, handed on as \`--command \${{ matrix.command }}\` and \`--build \${{ matrix.build }}\`.`,
            ]
          : []),
        ...(throughCiJob && !reports
          ? [
              `${label} runs its matrix through \`z:ci-job\` without the step after it that runs \`pnpm run --silent z:check-changed-gap\` ("When a check fails" in .github/workflows/README.md); add it as code-check.yml has it.`,
            ]
          : []),
        ...(throughCiJob && assertsClean
          ? [
              `${label} runs \`z:assert-repo-is-clean\` beside \`z:ci-job\`, which checks the tree itself and names the step that wrote; remove the step.`,
            ]
          : []),
      ],
    ),
    ...rawAllowed.flatMap(({ relativePath, reason }) => [
      ...(bareWorkflows.has(relativePath)
        ? []
        : [
            `RAW_MATRIX_ALLOWED in check-ci-job-shape.mts names ${relativePath}, which is no check workflow running a matrix without \`z:ci-job\` any more; remove the entry.`,
          ]),
      ...(reason.trim() === ''
        ? [
            `RAW_MATRIX_ALLOWED in check-ci-job-shape.mts allows ${relativePath} with no reason; say why its matrix runs without \`z:ci-job\`.`,
          ]
        : []),
    ]),
    ...Array.from(ciJobWorkflows)
      .filter((relativePath) => !checkAllSet.has(relativePath))
      .map(
        (relativePath) =>
          `${relativePath} runs its matrix through \`z:ci-job\`, and \`check-all\` does not read it; add it to MATRIX_WORKFLOWS in check-all.mts.`,
      ),
    ...checkAllWorkflows
      .filter((relativePath) => !ciJobWorkflows.has(relativePath))
      .map((relativePath) =>
        nonCheck.has(relativePath)
          ? `MATRIX_WORKFLOWS in check-all.mts names ${relativePath}, which no pull request runs; remove it, or restore its \`pull_request\` trigger.`
          : `MATRIX_WORKFLOWS in check-all.mts names ${relativePath}, which runs no matrix through \`z:ci-job\`; remove it, or run that matrix through \`z:ci-job\`.`,
      ),
  ];
};

export type RawAllowance = Readonly<{
  relativePath: string;
  reason: string;
}>;

/** The check workflows that run their matrix entries without `z:ci-job`. */
const RAW_MATRIX_ALLOWED: readonly RawAllowance[] = [
  {
    relativePath: '.github/workflows/node-version-compatibility.yml',
    reason:
      'Runs the test suites on the other Node.js versions; nothing it runs writes, and check-all runs the same suites on the Node.js the repository pins.',
  },
] as const;

/** The matrix key the value of `flag` names, `--flag x` or `--flag=x`. */
const optionValue = (
  args: readonly string[],
  flag: string,
): string | undefined =>
  matrixKeyOf(optionValues(args, new Set<string>([flag])).at(0) ?? '');

/** Why `check-all` could not read a `z:ci-job` job's matrix, if it could not. */
const unreadableMatrix = (
  job: WorkflowJob,
  ciJobRuns: readonly PnpmRun[],
): string | undefined => {
  const matrix = readMatrix(job.matrix);

  if (Result.isErr(matrix)) {
    return matrix.value;
  }

  const { include, lists } = matrix.value;

  const listed = Object.keys(lists);

  if (Arr.isNonEmpty(listed)) {
    return `${listed.map((key) => `\`${key}\``).join(', ')} given as a list`;
  }

  if (Arr.isEmpty(include)) {
    return 'no `include:` entries';
  }

  if (include.some(({ command }) => command === undefined)) {
    return 'an `include:` entry without a `command`';
  }

  if (
    ciJobRuns.some((run) => optionValue(run.args, CI_JOB_COMMAND) !== 'command')
  ) {
    return `a \`${CI_JOB}\` not handed \`${CI_JOB_COMMAND} \${{ matrix.command }}\``;
  }

  return include.some(({ build }) => build !== undefined) &&
    ciJobRuns.some((run) => optionValue(run.args, CI_JOB_BUILD) !== 'build')
    ? `a \`${CI_JOB}\` not handed \`${CI_JOB_BUILD} \${{ matrix.build }}\``
    : undefined;
};

/**
 * What a matrix job runs, by the scripts of its `pnpm run`s: through `z:ci-job`
 * or a matrix value run bare beside it, the report, a clean-tree assertion, why
 * `check-all` could not read its matrix, and what the shell reader could not
 * read.
 */
const readJob = (
  job: WorkflowJob,
): Readonly<{
  throughCiJob: boolean;
  alsoBare: boolean;
  unreadable: string | undefined;
  reports: boolean;
  assertsClean: boolean;
  problems: readonly string[];
}> => {
  const readings = job.steps.map((step) => ({
    step,
    reading: readShellCommands(step.run ?? ''),
  }));

  const runs = readings.flatMap(({ step, reading }) =>
    Arr.generate(function* () {
      for (const words of reading.commands) {
        const run = readPnpmRun(
          words.map((word) =>
            expandVariable(word, { ...job.env, ...step.env }),
          ),
        );

        if (run !== undefined) {
          yield run;
        }
      }
    }),
  );

  const ciJobRuns = runs.filter(({ script }) => script === CI_JOB);

  const runsScript = (script: string): boolean =>
    runs.some((run) => run.script === script);

  return {
    throughCiJob: Arr.isNonEmpty(ciJobRuns),
    alsoBare: runs.some(({ script }) => matrixKeyOf(script) !== undefined),
    unreadable: unreadableMatrix(job, ciJobRuns),
    reports: runsScript(GAP_REPORT),
    assertsClean: runsScript(CLEAN_TREE_ASSERTION),
    problems: readings.flatMap(({ reading }) => reading.problems),
  };
};

/**
 * Whether a matrix job runs entries: its matrix names a `command`, however a
 * step runs it, by a script or through an action; or a step's script reads a
 * matrix value, in its `run:` or through its `env:`, whatever the key. A matrix
 * it cannot read counts, so that the reason is reported. A job that does
 * neither hands its values to actions alone and has no entry for `z:ci-job` to
 * run: `coverage-pr` in code-check.yml names the artifacts it uploads.
 */
const runsEntries = (job: WorkflowJob): boolean => {
  const matrix = readMatrix(job.matrix);

  return (
    Result.isErr(matrix) ||
    Arr.isNonEmpty(matrixValues(matrix.value, 'command')) ||
    job.steps.some(
      ({ run, env }) =>
        run !== undefined &&
        Arr.toUnshifted(run)(Object.values({ ...job.env, ...env })).some(
          (text) => text.includes(MATRIX_CONTEXT),
        ),
    )
  );
};

const MATRIX_CONTEXT = 'matrix.';

const GAP_REPORT = 'z:check-changed-gap';

const CLEAN_TREE_ASSERTION = 'z:assert-repo-is-clean';

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkCiJobShape().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `✅ The ${result.value} check workflows run their matrices through z:ci-job with its report, or are allowed not to, and check-all reads the ones that do.`,
  );
}
