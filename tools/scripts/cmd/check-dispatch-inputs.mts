import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { plural } from '../lib/plural.mjs';
import { listWorkflowFiles } from '../lib/repo-files.mjs';
import {
  CHECK_GATES_WORKFLOW,
  parseWorkflow,
  workflowTriggers,
} from '../lib/workflow-jobs.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Holds every workflow that calls `check-gates.yml` to a `workflow_dispatch`
 * trigger with no inputs: the queue dispatches each layer with none (README.md,
 * "Triggers"), so a required input would refuse its dispatch, and an optional
 * one would judge a manual run otherwise than the queue's, which the gate's
 * reuse of verdicts by tree does not tell apart.
 *
 * The queue dispatches the workflows `.github/unblock-prs.json` lists under
 * `speculate.workflows`, which therefore has to be exactly the gate's callers:
 * one left out would not check the layers, and the pull request would run it in
 * full when its turn came.
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

    const configured = yield* Result.safeUnwrap(await readSpeculateWorkflows());

    const messages = [
      ...violations.messages,
      ...speculateWorkflowViolations(violations.callerNames, configured),
    ] as const;

    return Arr.isNonEmpty(messages)
      ? Result.err(messages.join('\n'))
      : Result.ok(violations.callerNames.length);
  });

/**
 * What is wrong with `speculate.workflows` against the gate's callers, by file
 * name; nothing when the repository does not check ahead.
 */
export const speculateWorkflowViolations = (
  callers: readonly string[],
  configured: readonly string[] | undefined,
): readonly string[] => {
  if (configured === undefined) {
    return [];
  }

  const listed = new Set(configured);

  const calling = new Set(callers);

  return [
    ...callers
      .filter((name) => !listed.has(name))
      .map(
        (name) =>
          `${UNBLOCK_PRS_CONFIG}: speculate.workflows leaves out ${name}, which calls check-gates.yml: the layers would not be checked by it.`,
      ),
    ...configured
      .filter((name) => !calling.has(name))
      .map(
        (name) =>
          `${UNBLOCK_PRS_CONFIG}: speculate.workflows names ${name}, which does not call check-gates.yml.`,
      ),
  ];
};

/**
 * What is wrong with the workflows that call the gate, one message each,
 * prefixed with the file, and the callers' file names. A workflow that does not
 * name the gate is not parsed, so a syntax error in one is left to the guards
 * that read it. None calling it is itself an error: the gate is called by its
 * path, and a rename that left this reading nothing would pass it with nothing
 * checked.
 */
export const findDispatchInputViolations = (
  workflows: readonly Readonly<{ relativePath: string; text: string }>[],
): Readonly<{
  callerNames: readonly string[];
  messages: readonly string[];
}> => {
  const parsed = workflows
    .filter(({ text }) => text.includes(CHECK_GATES_WORKFLOW))
    .map(({ relativePath, text }) => ({
      relativePath,
      workflow: parseWorkflow(text),
    }));

  const unparsed = Arr.generate(function* () {
    for (const { relativePath, workflow } of parsed) {
      if (Result.isErr(workflow)) {
        yield { relativePath, error: workflow.value };
      }
    }
  });

  const callers = Arr.generate(function* () {
    for (const { relativePath, workflow } of parsed) {
      if (Result.isOk(workflow) && callsGates(workflow.value)) {
        yield { relativePath, workflow: workflow.value };
      }
    }
  });

  return {
    // A file that names the gate but does not parse is reported below, and
    // still counted, so that `speculate.workflows` is not told it names a
    // workflow that does not call the gate.
    callerNames: [...callers, ...unparsed].map(({ relativePath }) =>
      path.posix.basename(relativePath),
    ),
    messages: [
      ...unparsed.map(({ relativePath, error }) => `${relativePath}: ${error}`),
      ...(Arr.isNonEmpty(callers) || Arr.isNonEmpty(unparsed)
        ? []
        : [
            `No workflow calls ${CHECK_GATES_WORKFLOW}: the gate is found by that path, so a rename leaves nothing for this guard to check.`,
          ]),
      ...callers.flatMap(({ relativePath, workflow }) =>
        dispatchInputViolations(workflow).map(
          (message) => `${relativePath}: ${message}`,
        ),
      ),
    ],
  };
};

/**
 * What is wrong with one parsed workflow's `workflow_dispatch`, one message
 * each: it has to be a trigger, in any form `on:` takes, and declare no input,
 * since a queue dispatches every check workflow with none (README.md,
 * "Triggers").
 */
export const dispatchInputViolations = (
  workflow: unknown,
): readonly string[] => {
  if (!workflowTriggers(workflow).includes('workflow_dispatch')) {
    return [
      'it does not trigger on `workflow_dispatch`, so a queue cannot dispatch it.',
    ];
  }

  const on = isRecord(workflow) ? workflow['on'] : undefined;

  // Only the mapping form can declare inputs.
  const dispatch = isRecord(on) ? on['workflow_dispatch'] : undefined;

  const inputs = isRecord(dispatch) ? dispatch['inputs'] : undefined;

  const declared = isRecord(inputs) ? Object.keys(inputs) : ([] as const);

  return Arr.isNonEmpty(declared)
    ? [
        `\`workflow_dispatch\` declares ${declared.map((name) => `\`${name}\``).join(', ')}, which a queue's dispatch does not supply.`,
      ]
    : [];
};

const UNBLOCK_PRS_CONFIG = '.github/unblock-prs.json';

const callsGates = (workflow: unknown): boolean => {
  const jobs = isRecord(workflow) ? workflow['jobs'] : undefined;

  return (
    isRecord(jobs) &&
    Object.values(jobs).some(
      (job) => isRecord(job) && job['uses'] === CHECK_GATES_WORKFLOW,
    )
  );
};

/** `speculate.workflows` of the queue's configuration, if it checks ahead. */
const readSpeculateWorkflows = async (): Promise<
  Result<readonly string[] | undefined, string>
> => {
  const read = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the repository's own configuration file.
    fs.readFile(path.join(projectRootPath, UNBLOCK_PRS_CONFIG), 'utf8'),
  );

  if (Result.isErr(read)) {
    return Result.ok(undefined);
  }

  const parsed = Result.fromThrowable((): unknown => JSON.parse(read.value));

  if (Result.isErr(parsed)) {
    return Result.err(
      `${UNBLOCK_PRS_CONFIG}: ${unknownToString(parsed.value)}`,
    );
  }

  const speculate = isRecord(parsed.value)
    ? parsed.value['speculate']
    : undefined;

  const workflows = isRecord(speculate) ? speculate['workflows'] : undefined;

  return Result.ok(
    Arr.isArray(workflows)
      ? workflows.filter((name): name is string => typeof name === 'string')
      : undefined,
  );
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkDispatchInputs().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  // Each message says what is wrong on its own, so no header frames them all as
  // one kind of failure.
  if (Result.isErr(result)) {
    console.error(
      result.value
        .split('\n')
        .map((message) => `❌ ${message}`)
        .join('\n'),
    );

    process.exit(1);
  }

  console.info(
    `${plural(result.value, 'workflow')} call check-gates.yml, and each takes a dispatch with no inputs.`,
  );
}
