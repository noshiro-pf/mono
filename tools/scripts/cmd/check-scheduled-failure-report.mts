import * as path from 'node:path';
import { Arr, isRecord, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { plural } from '../lib/plural.mjs';
import { listWorkflowFiles, readRepositoryFile } from '../lib/repo-files.mjs';
import { parseWorkflow, triggersOf } from '../lib/workflow-jobs.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Holds `on.workflow_run.workflows` of `report-scheduled-failure.yml` to the
 * workflows that run on a schedule, both ways.
 *
 * That list is what turns a failed scheduled run into an issue, and it matches
 * a workflow by its `name:`, so a scheduled workflow added or renamed without
 * the list being changed would fail with nobody told, and the stale name left
 * behind would match nothing; GitHub says neither. A listed name whose
 * workflows all run without a schedule is reported too: the report's job acts
 * only on a run whose event is `schedule`.
 */
export const checkScheduledFailureReport = (): Promise<
  Result<readonly string[], string>
> =>
  Result.safeTry(async function* () {
    const paths = yield* Result.safeUnwrap(await listWorkflowFiles());

    const read = await Promise.all(
      paths.map(async (workflowPath) => {
        const relativePath = path
          .relative(projectRootPath, workflowPath)
          .split(path.sep)
          .join('/');

        return Result.map(await readRepositoryFile(relativePath), (text) => ({
          relativePath,
          text,
        }));
      }),
    );

    const failed = read.find(Result.isErr);

    if (failed !== undefined) {
      return failed;
    }

    const workflows = Arr.generate(function* () {
      for (const result of read) {
        if (Result.isOk(result)) {
          yield result.value;
        }
      }
    });

    const found = yield* Result.safeUnwrap(
      findScheduledFailureReportViolations(workflows),
    );

    return Arr.isNonEmpty(found.messages)
      ? Result.err(found.messages.join('\n'))
      : Result.ok(found.reported);
  });

/**
 * What is wrong with the list against the workflows, one message each, and the
 * names it lists. A workflow that does not parse, or a report workflow that is
 * missing or not on `workflow_run`, is an error rather than a message: the
 * comparison would then read nothing.
 */
export const findScheduledFailureReportViolations = (
  workflows: readonly Readonly<{ relativePath: string; text: string }>[],
): Result<
  Readonly<{ reported: readonly string[]; messages: readonly string[] }>,
  string
> => {
  const parsed = workflows.map(({ relativePath, text }) => ({
    relativePath,
    workflow: Result.mapErr(
      parseWorkflow(text),
      (message) => `${relativePath}: ${message}`,
    ),
  }));

  const unparsed = Arr.generate(function* () {
    for (const { workflow } of parsed) {
      if (Result.isErr(workflow)) {
        yield workflow.value;
      }
    }
  });

  if (Arr.isNonEmpty(unparsed)) {
    return Result.err(unparsed.join('\n'));
  }

  const read = Arr.generate(function* () {
    for (const { relativePath, workflow } of parsed) {
      if (Result.isOk(workflow)) {
        yield {
          relativePath,
          name: nameOf(workflow.value),
          isScheduled: triggersOf(workflow.value).includes('schedule'),
          workflow: workflow.value,
        };
      }
    }
  });

  const reportWorkflow = read.find(
    ({ relativePath }) => relativePath === REPORT_WORKFLOW,
  );

  if (reportWorkflow === undefined) {
    return Result.err(`${REPORT_WORKFLOW} is missing.`);
  }

  const names = reportedNames(reportWorkflow.workflow);

  if (Result.isErr(names)) {
    return names;
  }

  const reported = names.value;

  const listed = new Set(reported);

  const scheduledMessages = read
    .filter(({ isScheduled }) => isScheduled)
    .flatMap(({ relativePath, name }) =>
      name === undefined
        ? [
            `${relativePath}: runs on a schedule and has no \`name:\`, which is what on.workflow_run.workflows matches.`,
          ]
        : listed.has(name)
          ? []
          : [
              `${relativePath}: "${name}" runs on a schedule and is not named under on.workflow_run.workflows in ${REPORT_WORKFLOW}, so a failed scheduled run of it would tell nobody.`,
            ],
    );

  const listedMessages = reported.flatMap((name) => {
    const named = read.filter((workflow) => workflow.name === name);

    if (!Arr.isNonEmpty(named)) {
      return [
        `${REPORT_WORKFLOW}: on.workflow_run.workflows names "${name}", which is the name of no workflow.`,
      ];
    }

    // Names need not be unique; the entry is needed while any workflow of that
    // name runs on a schedule.
    return named.some(({ isScheduled }) => isScheduled)
      ? []
      : [
          `${REPORT_WORKFLOW}: on.workflow_run.workflows names "${name}" (${named.map(({ relativePath }) => relativePath).join(', ')}), which does not run on a schedule.`,
        ];
  });

  return Result.ok({
    reported,
    messages: [...scheduledMessages, ...listedMessages],
  });
};

export const REPORT_WORKFLOW = '.github/workflows/report-scheduled-failure.yml';

const NOT_A_LIST =
  `${REPORT_WORKFLOW}: on.workflow_run.workflows is not a list of workflow names.` as const;

const nameOf = (workflow: unknown): string | undefined => {
  const name = isRecord(workflow) ? workflow['name'] : undefined;

  return typeof name === 'string' ? name : undefined;
};

const asList = (value: unknown): readonly unknown[] | undefined =>
  Arr.isArray(value) ? value : undefined;

/**
 * The names under `on.workflow_run.workflows`, none when the key is empty or
 * absent; an error when the workflow is not on `workflow_run`, or the key holds
 * anything but a list of names, which would otherwise read as names left out.
 */
const reportedNames = (
  workflow: unknown,
): Result<readonly string[], string> => {
  const on = isRecord(workflow) ? workflow['on'] : undefined;

  const workflowRun = isRecord(on) ? on['workflow_run'] : undefined;

  if (!isRecord(workflowRun)) {
    return Result.err(
      `${REPORT_WORKFLOW}: it does not trigger on \`workflow_run\` (as a key of \`on:\`).`,
    );
  }

  const names = workflowRun['workflows'];

  if (names === undefined || names === null) {
    return Result.ok([]);
  }

  const list = asList(names);

  if (list === undefined) {
    return Result.err(NOT_A_LIST);
  }

  const strings = list.filter(
    (name): name is string => typeof name === 'string',
  );

  return strings.length === list.length
    ? Result.ok(strings)
    : Result.err(NOT_A_LIST);
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkScheduledFailureReport().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(
      [
        `❌ ${REPORT_WORKFLOW} does not name exactly the workflows that run on a`,
        '   schedule, so a failed scheduled run could go unreported:',
        '',
        result.value,
      ].join('\n'),
    );

    process.exit(1);
  }

  console.info(
    `${plural(result.value.length, 'scheduled workflow')} reported by ${path.posix.basename(REPORT_WORKFLOW)}, and every name it lists is one of them.`,
  );
}
