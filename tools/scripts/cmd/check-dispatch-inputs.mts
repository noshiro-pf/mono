import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, hasKey, isRecord, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { parse } from 'yaml';
import { plural } from '../lib/plural.mjs';
import { listWorkflowFiles } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Holds every workflow that calls `check-gates.yml` to the `workflow_dispatch`
 * input the gate reads off its caller's event: `diff-parent`, a boolean that is
 * `false` unless set.
 *
 * A queue dispatches every check workflow on a layer with it set, and the gate
 * diffs the layer against its parent (README.md, "Triggers"). A check workflow
 * that did not declare it would refuse that dispatch, and one that declared it
 * as a string would hand the gate whatever was typed; either way that workflow
 * would judge the layer otherwise than the rest, and nothing else says so.
 */
export const checkDispatchInputs = (): Promise<Result<number, string>> =>
  Result.safeTry(async function* () {
    const paths = yield* Result.safeUnwrap(await listWorkflowFiles());

    const workflows = await Promise.all(
      paths.map(async (workflowPath) => ({
        relativePath: path
          .relative(projectRootPath, workflowPath)
          .split(path.sep)
          .join('/'),
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a workflow file listWorkflowFiles found.
        text: await fs.readFile(workflowPath, 'utf8'),
      })),
    );

    const violations = findDispatchInputViolations(workflows);

    return Result.isErr(violations)
      ? violations
      : Arr.isNonEmpty(violations.value.messages)
        ? Result.err(violations.value.messages.join('\n'))
        : Result.ok(violations.value.callers);
  });

/**
 * What is wrong with the workflows, one message each, and how many call the
 * gate. None calling it is itself an error: the gate is called by its path, and
 * a rename that left this reading nothing would pass it with nothing checked.
 */
export const findDispatchInputViolations = (
  workflows: readonly Readonly<{ relativePath: string; text: string }>[],
): Result<
  Readonly<{ callers: number; messages: readonly string[] }>,
  string
> => {
  const parsed = workflows.map(({ relativePath, text }) => ({
    relativePath,
    workflow: Result.mapErr(
      Result.fromThrowable((): unknown => parse(text)),
      (error) => `${relativePath}: ${unknownToString(error)}`,
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

  const callers = Arr.generate(function* () {
    for (const { relativePath, workflow } of parsed) {
      if (Result.isOk(workflow) && callsGates(workflow.value)) {
        yield { relativePath, workflow: workflow.value };
      }
    }
  });

  if (!Arr.isNonEmpty(callers)) {
    return Result.err(`No workflow calls ${GATES_WORKFLOW}.`);
  }

  return Result.ok({
    callers: callers.length,
    messages: callers.flatMap(({ relativePath, workflow }) =>
      dispatchInputViolations(workflow).map(
        (message) => `${relativePath}: ${message}`,
      ),
    ),
  });
};

/**
 * What is wrong with one parsed workflow's `workflow_dispatch`, one message
 * each: it has to be a trigger, with a `diff-parent` input that is a boolean
 * defaulting to `false`, and no other input, since a queue dispatches every
 * check workflow with that one alone (README.md, "Triggers").
 */
export const dispatchInputViolations = (
  workflow: unknown,
): readonly string[] => {
  const on = isRecord(workflow) ? workflow['on'] : undefined;

  if (!isRecord(on) || !hasKey(on, 'workflow_dispatch')) {
    return [
      'it does not trigger on `workflow_dispatch` (as a key of `on:`), so a queue cannot dispatch it.',
    ];
  }

  const dispatch = on.workflow_dispatch;

  const inputs = isRecord(dispatch) ? dispatch['inputs'] : undefined;

  const input = isRecord(inputs) ? inputs['diff-parent'] : undefined;

  const others = isRecord(inputs)
    ? Object.keys(inputs).filter((name) => name !== 'diff-parent')
    : ([] as const);

  return [
    ...(isRecord(input) &&
    input['type'] === 'boolean' &&
    input['default'] === false
      ? []
      : [
          '`workflow_dispatch` has no `diff-parent` input of `type: boolean` and `default: false`.',
        ]),
    ...(Arr.isNonEmpty(others)
      ? [
          `\`workflow_dispatch\` declares ${others.map((name) => `\`${name}\``).join(', ')}, which a queue's dispatch does not supply.`,
        ]
      : []),
  ];
};

const GATES_WORKFLOW = './.github/workflows/check-gates.yml';

const callsGates = (workflow: unknown): boolean => {
  const jobs = isRecord(workflow) ? workflow['jobs'] : undefined;

  return (
    isRecord(jobs) &&
    Object.values(jobs).some(
      (job) => isRecord(job) && job['uses'] === GATES_WORKFLOW,
    )
  );
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkDispatchInputs().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(
      [
        '❌ The workflows that call check-gates.yml do not all take the dispatch',
        '   input the gate reads (README.md, "Triggers"):',
        '',
        result.value,
      ].join('\n'),
    );

    process.exit(1);
  }

  console.info(
    `${plural(result.value, 'workflow')} call check-gates.yml, and each takes the diff-parent input.`,
  );
}
