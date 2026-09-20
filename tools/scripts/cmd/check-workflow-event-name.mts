import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { glob, isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a workflow compares `github.event_name` against an event it does
 * not trigger on.
 *
 * `github.event_name` is the name of the trigger that started the run, so such
 * a comparison is not a stale comment — it is a constant. `== 'x'` is always
 * `false` and `!= 'x'` always `true`, which is exactly the shape that has no
 * symptom: nothing errors, nothing is red, and the expression quietly stops
 * being a condition.
 *
 * Seven workflows here are built on one: `cancel-in-progress` is written as
 * `${{ github.event_name == 'pull_request' }}` rather than `true` so that a
 * `workflow_dispatch` or `push` run is left alone. Left naming the old event
 * after a trigger moves, that expression turns `cancel-in-progress` off
 * altogether — and in `skip-ci-label.yml` that is a `labeled` run writing
 * `pending` after the `unlabeled` run wrote `success`, leaving a pull request
 * blocked with no label on it. The same sentence is one edit in the `on:`
 * block away in every one of them, which is why this is asked of the
 * directory rather than of one file.
 *
 * A workflow reached through `workflow_call` is not asked. Inside a reusable
 * workflow `github.event_name` is the *caller's* event, never `workflow_call`,
 * so its own trigger list says nothing about what the comparison may name.
 */
export const checkWorkflowEventName = (): Promise<
  Result<CheckSummary, string>
> =>
  Result.safeTry(async function* () {
    const workflowPaths = yield* Result.safeUnwrap(await collectWorkflows());

    const workflows = yield* Result.safeUnwrap(
      await readWorkflows(workflowPaths),
    );

    const violations = workflows.flatMap(({ relativePath, triggers }) =>
      collectEventNameViolations(triggers).map(
        (message) => `${relativePath}: ${message}`,
      ),
    );

    if (!Arr.isNonEmpty(violations)) {
      return Result.ok({
        workflows: workflows.length,
        comparisons: workflows.reduce(
          (total, { triggers }) => total + triggers.comparedEventNames.length,
          0,
        ),
      });
    }

    return Result.err(formatViolations(violations));
  });

/**
 * The trigger events of a workflow and the event names its expressions compare
 * against, read with a line scanner rather than a YAML parser — as
 * `check-minimum-release-age.mts` reads `pnpm-workspace.yaml`. Both sit at a
 * fixed depth in a file whose shape is stable, and a parser would be a
 * dependency taken on for one nesting level.
 */
export const parseWorkflowTriggers = (
  workflowFile: string,
): WorkflowTriggers => {
  const lines = workflowFile.split('\n');

  return {
    triggerEvents: collectTriggerEvents(lines),
    comparedEventNames: collectComparedEventNames(workflowFile),
  };
};

/**
 * What is wrong with one workflow's comparisons, as one message per problem.
 *
 * Empty for a workflow that compares nothing, and for a reusable one — see the
 * note on `workflow_call` above.
 */
export const collectEventNameViolations = (
  triggers: WorkflowTriggers,
): readonly string[] => {
  if (!Arr.isNonEmpty(triggers.comparedEventNames)) return [];

  if (triggers.triggerEvents.includes(REUSABLE_EVENT)) return [];

  if (!Arr.isNonEmpty(triggers.triggerEvents)) {
    return [
      [
        'compares `github.event_name` but no `on:` block could be read, so',
        'nothing here can say whether the comparison names a real trigger.',
      ].join(' '),
    ] as const;
  }

  return triggers.comparedEventNames.flatMap((eventName) =>
    triggers.triggerEvents.includes(eventName)
      ? []
      : [
          [
            `\`github.event_name\` is compared against '${eventName}', which is`,
            'not a trigger of this workflow, so the comparison is constant.',
            `Its triggers are: ${triggers.triggerEvents.join(', ')}.`,
          ].join(' '),
        ],
  );
};

export type WorkflowTriggers = Readonly<{
  triggerEvents: readonly string[];
  comparedEventNames: readonly string[];
}>;

type Workflow = Readonly<{
  relativePath: string;
  triggers: WorkflowTriggers;
}>;

type CheckSummary = Readonly<{
  workflows: number;
  comparisons: number;
}>;

const WORKFLOW_GLOB = '.github/workflows/*.yml';

const REUSABLE_EVENT = 'workflow_call';

const TRIGGER_BLOCK_KEY = 'on:';

/**
 * Every event name compared against `github.event_name`.
 *
 * Only a comparison is read, rather than every quoted string in the
 * expression: `github.ref == 'refs/heads/main'` quotes something that is not
 * an event name, and taking it for one would fail the check on a workflow that
 * is correct.
 */
const EVENT_NAME_COMPARISON =
  /github\.event_name\s*[=!]=\s*'(?<eventName>[^']+)'/gu;

/**
 * The keys of the `on:` block: the lines indented exactly one level below a
 * bare `on:`, up to the first line that starts a key of its own.
 */
const collectTriggerEvents = (lines: readonly string[]): readonly string[] => {
  const blockIndex = lines.findIndex(
    (line) => line.trimEnd() === TRIGGER_BLOCK_KEY,
  );

  if (blockIndex === -1) return [];

  const rest = lines.slice(blockIndex + 1);

  const endIndex = rest.findIndex(
    (line) => line !== '' && !line.startsWith(' '),
  );

  const block = endIndex === -1 ? rest : rest.slice(0, endIndex);

  return block.flatMap((line) => {
    const matched = /^ {2}(?<eventName>[a-z_]+):/u.exec(line);

    const eventName = matched?.groups?.['eventName'];

    return eventName === undefined ? [] : [eventName];
  });
};

const collectComparedEventNames = (workflowFile: string): readonly string[] => {
  const matches = Array.from(workflowFile.matchAll(EVENT_NAME_COMPARISON));

  return matches.flatMap((matched) => {
    const eventName = matched.groups?.['eventName'];

    return eventName === undefined ? [] : [eventName];
  });
};

const collectWorkflows = async (): Promise<
  Result<readonly string[], string>
> => {
  const result = await glob(WORKFLOW_GLOB, {
    cwd: projectRootPath,
    absolute: true,
  });

  return Result.isErr(result)
    ? Result.err(
        `Failed to list ${WORKFLOW_GLOB}: ${unknownToString(result.value)}`,
      )
    : Result.ok(result.value.toSorted());
};

const readWorkflows = async (
  workflowPaths: readonly string[],
): Promise<Result<readonly Workflow[], string>> => {
  const results = await Promise.all(workflowPaths.map(readWorkflow));

  const firstError = results.find(Result.isErr);

  return firstError !== undefined
    ? Result.err(firstError.value)
    : Result.ok(
        results.flatMap((result) =>
          Result.isErr(result) ? [] : [result.value],
        ),
      );
};

const readWorkflow = async (
  workflowPath: string,
): Promise<Result<Workflow, string>> => {
  const relativePath = path.relative(projectRootPath, workflowPath);

  const result = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(workflowPath, 'utf8'),
  );

  return Result.isErr(result)
    ? Result.err(
        `Failed to read ${relativePath}: ${unknownToString(result.value)}`,
      )
    : Result.ok({
        relativePath,
        triggers: parseWorkflowTriggers(result.value),
      });
};

const formatViolations = (violations: readonly string[]): string =>
  [
    '❌ A workflow compares `github.event_name` against an event it does not',
    '   trigger on, so the comparison is a constant:',
    '',
    ...violations.map((message) => `  ${message}`),
    '',
    'See CLAUDE.md, "Triggers, `skip-ci`, out-of-date branches":',
    'moving a trigger and leaving the comparison behind turns',
    '`cancel-in-progress` off with nothing to say so.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkWorkflowEventName().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    [
      'Every `github.event_name` comparison names a real trigger',
      `(${result.value.comparisons} across ${result.value.workflows} workflows).`,
    ].join(' '),
  );
}
