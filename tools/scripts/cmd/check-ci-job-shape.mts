import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, asUint32, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { listWorkflowFiles } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import { MATRIX_WORKFLOWS } from './check-all.mjs';
import { readMatrixInclude } from './check-ci-commands.mjs';
import { parseWorkflowTriggers } from './check-workflow-event-name.mjs';

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
          relativePath: path
            .relative(projectRootPath, workflowPath)
            .split(path.sep)
            .join('/'),
          text,
          isCheck:
            parseWorkflowTriggers(text).triggerEvents.includes('pull_request'),
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
 * (a job with a `matrix:`) of a check workflow either runs `z:ci-job`, and then
 * carries the report and no clean-tree step of its own, or runs its entries
 * some other way, which its workflow has to be allowed to do. Read job by job,
 * leaving out comments and step names, so that one job's step answers for no
 * other and a mention is not a run.
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
  const jobs = workflows.flatMap(({ relativePath, text, isCheck }) =>
    splitJobs(text)
      .filter(({ lines }) => lines.some((line) => MATRIX_KEY.test(line)))
      .map(({ name, lines }) => {
        const runs = (pattern: RegExp): boolean =>
          lines.some((line) => pattern.test(line));

        // Each command of a line on its own: `a && b` runs both.
        const commands = lines.flatMap((line) => line.split(/&&|;|\|\|/u));

        // What check-all reads, read the way it reads it.
        const entries = readMatrixInclude(lines.join('\n'));

        const ciJobLines = lines.filter((line) => CI_JOB_RUN.test(line));

        return {
          relativePath,
          isCheck,
          label: `${relativePath} (job \`${name}\`)`,
          throughCiJob: Arr.isNonEmpty(ciJobLines),
          // A matrix entry run beside `z:ci-job`, outside it; the report step
          // names the entry and runs none.
          alsoBare: commands.some(
            (command) =>
              BARE_MATRIX_RUN.test(command) &&
              !CI_JOB_RUN.test(command) &&
              !GAP_REPORT.test(command),
          ),
          readable:
            Arr.isNonEmpty(entries) &&
            entries.every(({ command }) => command !== undefined) &&
            ciJobLines.every((line) => CI_JOB_COMMAND.test(line)) &&
            (entries.every(({ build }) => build === undefined) ||
              ciJobLines.every((line) => CI_JOB_BUILD.test(line))),
          reports: runs(GAP_REPORT),
          assertsClean: runs(CLEAN_TREE_ASSERTION),
        };
      }),
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
    ...checkJobs.flatMap(
      ({
        relativePath,
        label,
        throughCiJob,
        alsoBare,
        readable,
        reports,
        assertsClean,
      }) => [
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
        ...(throughCiJob && !readable
          ? [
              `${label} runs \`z:ci-job\` on a matrix \`check-all\` cannot read: it reads the \`include:\` entries and their \`command\` and \`build\`, handed on as \`--command \${{ matrix.command }}\`.`,
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

/** A `matrix:` key, block or flow style (`strategy: { matrix: … }`). */
const MATRIX_KEY = /(?:^|[\s{,])matrix:/u;

const CI_JOB_BUILD = /--build\s+\$\{\{\s*matrix\.build\s*\}\}/u;

// Each script name ends where no name character follows, so that `z:ci-job-x`
// is not `z:ci-job`.
const CI_JOB_RUN = /\bpnpm run z:ci-job(?![\w:-])/u;

const CI_JOB_COMMAND = /--command\s+\$\{\{\s*matrix\.command\s*\}\}/u;

const BARE_MATRIX_RUN = /\bpnpm run [^\n]*\$\{\{\s*matrix\./u;

const GAP_REPORT = /\bpnpm run --silent z:check-changed-gap(?![\w:-])/u;

const CLEAN_TREE_ASSERTION = /\bpnpm run z:assert-repo-is-clean(?![\w:-])/u;

const STEP_NAME = /^\s*(?:- )?name: /u;

/**
 * A line without its trailing ` # comment`: the first ` #` outside quotes, as a
 * shell or YAML reads one.
 */
const withoutTrailingComment = (line: string): string => {
  const mut_state = { open: '' };

  // By UTF-16 unit, as `line[index]` and `slice` count; every character tested
  // is ASCII.
  for (const index of Arr.seq(asUint32(line.length))) {
    const character = line[index] ?? '';

    if (mut_state.open !== '') {
      mut_state.open = character === mut_state.open ? '' : mut_state.open;

      continue;
    }

    if (character === "'" || character === '"') {
      mut_state.open = character;

      continue;
    }

    if (character === '#' && (index === 0 || line[index - 1] === ' ')) {
      return line.slice(0, index).trimEnd();
    }
  }

  return line;
};

/**
 * Each job under `jobs:`, its name and its lines, without comment lines, step
 * names and trailing comments: a job key is a line at the indentation of the
 * first one.
 */
const splitJobs = (
  text: string,
): readonly Readonly<{ name: string; lines: readonly string[] }>[] => {
  const lines = text
    .replaceAll('\r', '')
    .split('\n')
    .filter(
      (line) => !line.trimStart().startsWith('#') && !STEP_NAME.test(line),
    )
    .map(withoutTrailingComment);

  const start = lines.findIndex((line) => line.trimEnd() === 'jobs:');

  if (start === -1) {
    return [];
  }

  const rest = lines.slice(start + 1);

  // The block ends at the next top-level key (`env:`, `concurrency:`).
  const end = rest.findIndex((line) => line !== '' && !line.startsWith(' '));

  const body = end === -1 ? rest : rest.slice(0, end);

  const first = body.find((line) => line.trim() !== '');

  if (first === undefined) {
    return [];
  }

  const indent = first.length - first.trimStart().length;

  const isKey = (line: string): boolean =>
    line.length - line.trimStart().length === indent &&
    line.trimEnd().endsWith(':');

  const starts = body.flatMap((line, index) => (isKey(line) ? [index] : []));

  return starts.map((startIndex, position) => ({
    name: (body[startIndex] ?? '').trim().slice(0, -1),
    lines: body.slice(startIndex + 1, starts.at(position + 1) ?? body.length),
  }));
};

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
