import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { QUEUE_LAYER_BRANCH_PREFIX } from 'pr-report-core';
import { Arr, hasKey, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { plural } from '../lib/plural.mjs';
import { listWorkflowFiles } from '../lib/repo-files.mjs';
import {
  callsCheckGates,
  readWorkflowJobs,
  type WorkflowJob,
} from '../lib/workflow-jobs.mjs';

/**
 * Fails when a job or step of a check workflow runs only on a pull request and
 * says nothing of a queue layer.
 *
 * A queued pull request is checked on its queue layer, a `workflow_dispatch`
 * run on a `queue/*` branch, and its own run reuses that verdict and runs no
 * work (README.md, "Triggers"). So an `if:` reading
 * `github.event_name == 'pull_request'` and nothing of a layer is skipped on
 * the run that checks the change, and skipped again on the pull request's: the
 * failure report of `z:check-changed-gap` and the benchmark's branch comparison
 * went missing that way (#3800), and nothing failed.
 *
 * An `if:` passes when it also holds on every layer branch: a
 * `startsWith(github.ref, 'refs/heads/queue/')`, not negated, whose prefix
 * every layer's ref starts with (`refs/heads/` and then
 * `QUEUE_LAYER_BRANCH_PREFIX`, which the queue names its branches by). It also
 * passes when {@link PULL_REQUEST_ONLY} names it with the reason a layer's run
 * does not need it. Only `if:` is read: a `case(…)` choosing a value is not a
 * condition that skips anything.
 */
export const checkQueueLayerConditions = (): Promise<
  Result<CheckSummary, string>
> =>
  Result.safeTry(async function* () {
    const paths = yield* Result.safeUnwrap(await listWorkflowFiles());

    const workflows = await Promise.all(
      paths.map(async (workflowPath) => ({
        file: path.basename(workflowPath),
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a workflow file listWorkflowFiles found.
        jobs: readWorkflowJobs(await fs.readFile(workflowPath, 'utf8')),
      })),
    );

    const unread = Arr.generate(function* () {
      for (const { file, jobs } of workflows) {
        if (Result.isErr(jobs)) {
          yield `${file}: ${jobs.value}`;
        }
      }
    });

    const read = Arr.generate(function* () {
      for (const { file, jobs } of workflows) {
        if (Result.isOk(jobs)) {
          yield { file, jobs: jobs.value };
        }
      }
    });

    const violations = [
      ...unread,
      ...findQueueLayerViolations(read, PULL_REQUEST_ONLY),
    ] as const;

    return Arr.isNonEmpty(violations)
      ? Result.err(violations.join('\n'))
      : Result.ok({
          workflows: read.filter(({ jobs }) => callsCheckGates(jobs)).length,
        });
  });

/**
 * One message per pull-request-only `if:` of a check workflow (one that calls
 * `check-gates.yml`) that neither reads a queue layer nor is listed in
 * `allowed`, one per entry of `allowed` that names no such `if:`, and one per
 * key two such conditions share. A condition is keyed `<workflow>: <job>`, or
 * `<workflow>: <job> / <step>` by the step's `name:` (else its `id:`, else its
 * position), so that one entry never answers for two of them.
 */
export const findQueueLayerViolations = (
  workflows: readonly Readonly<{
    file: string;
    jobs: readonly WorkflowJob[];
  }>[],
  allowed: ReadonlyRecord<string, string>,
): readonly string[] => {
  const pullRequestOnly = workflows
    .filter(({ jobs }) => callsCheckGates(jobs))
    .flatMap(({ file, jobs }) =>
      jobs.flatMap((job) => [
        ...(isPullRequestOnly(job.condition) ? [`${file}: ${job.name}`] : []),
        ...job.steps.flatMap((step, index) =>
          isPullRequestOnly(step.condition)
            ? [`${file}: ${job.name} / ${step.name ?? `step ${index + 1}`}`]
            : [],
        ),
      ]),
    );

  const found = new Set<string>(pullRequestOnly);

  const shared = Array.from(found).filter(
    (key) => pullRequestOnly.indexOf(key) !== pullRequestOnly.lastIndexOf(key),
  );

  return [
    ...shared.map(
      (key) =>
        `${key}: more than one pull-request-only \`if:\` has this key; give the steps names of their own, so that each is judged on its own.`,
    ),
    ...Array.from(found)
      .filter((key) => !hasKey(allowed, key))
      .map(
        (key) =>
          `${key}: its \`if:\` holds only on a pull request, so it is skipped on the queue layer that checks a queued pull request, and the pull request's run reuses that verdict without running it either. Let it run on a layer too (\`startsWith(github.ref, 'refs/heads/queue/')\`, diffing against \`origin/main\` there), or add it to PULL_REQUEST_ONLY in check-queue-layer-conditions.mts with the reason a layer's run does not need it.`,
      ),
    ...Object.entries(allowed).flatMap(([key, reason]) => [
      ...(found.has(key)
        ? []
        : [
            `PULL_REQUEST_ONLY in check-queue-layer-conditions.mts names ${key}, which is no pull-request-only \`if:\` of a check workflow any more; remove the entry.`,
          ]),
      ...(reason.trim() === ''
        ? [
            `PULL_REQUEST_ONLY in check-queue-layer-conditions.mts names ${key} with no reason.`,
          ]
        : []),
    ]),
  ];
};

/**
 * Whether an `if:` reads `github.event_name == 'pull_request'` and no test that
 * holds on every queue layer's branch: a `startsWith(github.ref, '…')`, not
 * negated, whose prefix every layer's ref starts with and that is longer than
 * `refs/heads/`, which every branch's is.
 */
export const isPullRequestOnly = (condition: string | undefined): boolean =>
  condition !== undefined &&
  PULL_REQUEST_EVENT.test(condition) &&
  condition.matchAll(REF_PREFIX_TEST).every(
    ({ groups, index }) =>
      // Negated by a `!` before it, however spaced.
      condition.slice(0, index).trimEnd().endsWith('!') ||
      !isLayerPrefix(groups?.['prefix'] ?? ''),
  );

type CheckSummary = Readonly<{
  workflows: number;
}>;

/**
 * The pull-request-only conditions a queue layer's run does without, each with
 * the reason. Keyed as {@link findQueueLayerViolations} keys them.
 */
const PULL_REQUEST_ONLY: ReadonlyRecord<string, string> = {} as const;

const BRANCH_REFS = 'refs/heads/';

/** Every queue layer's `github.ref` starts with this. */
const LAYER_REF = `${BRANCH_REFS}${QUEUE_LAYER_BRANCH_PREFIX}` as const;

const PULL_REQUEST_EVENT = /github\.event_name\s*==\s*'pull_request'/u;

/**
 * As the workflows write it, `startsWith(github.ref, '…')`; a test spaced
 * otherwise is not read, and its condition is then reported, never passed.
 * Only a `!` right before the test reads as negating it: one in front of a
 * parenthesized group around it does not, which is a limit of reading the
 * expression as text rather than parsing it, and no workflow here writes one.
 */
const REF_PREFIX_TEST = /startsWith\(github\.ref, '(?<prefix>[^']*)'\)/gu;

const isLayerPrefix = (prefix: string): boolean =>
  prefix.length > BRANCH_REFS.length && LAYER_REF.startsWith(prefix);

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkQueueLayerConditions().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(
      [
        '❌ A check workflow skips a job or step on the queue layers, where queued',
        '   pull requests are checked (README.md, "Triggers"):',
        '',
        result.value,
      ].join('\n'),
    );

    process.exit(1);
  }

  console.info(
    `${plural(result.value.workflows, 'check workflow')} run every job and step on a queue layer that they run on a pull request.`,
  );
}
