/**
 * What has reported on one head commit, over REST (`snapshot/checks.mts`). Every
 * reader reads these here, the page included: GraphQL has neither the rounds'
 * `run_started_at` (#3474) nor the rounds a concurrency group holds (#3703).
 */

import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type {
  CheckRunFacts,
  CommitStatusFacts,
  HeadChecks,
  Read,
  WorkflowRoundFacts,
} from '../snapshot/index.mjs';
import { restAllPages, restAllPagesOf } from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * The checks on `sha`: every check run of every suite (`filter=all`; which
 * counts is decided later), the annotation titles of each run that completed
 * without passing, the latest status of each context, and every workflow run.
 * Unread when any of them is, since a part read as nothing would call a red
 * head one whose checks have not started.
 */
export const readHeadChecks = async (
  context: ReadContext,
  sha: string,
): Promise<Read<HeadChecks>> => {
  const what = `the checks of ${sha.slice(0, 7)}` as const;

  const [runs, statuses, rounds] = await Promise.all([
    restAllPagesOf(
      context,
      what,
      `/commits/${sha}/check-runs?filter=all`,
      CheckRunsSchema,
      (body) => body.check_runs,
    ),
    restAllPagesOf(
      context,
      what,
      `/commits/${sha}/status`,
      CombinedStatusSchema,
      (body) => body.statuses,
    ),
    restAllPagesOf(
      context,
      what,
      `/actions/runs?head_sha=${sha}`,
      WorkflowRunsSchema,
      (body) => body.workflow_runs,
    ),
  ]);

  if (Result.isErr(runs)) {
    return runs;
  }

  if (Result.isErr(statuses)) {
    return statuses;
  }

  if (Result.isErr(rounds)) {
    return rounds;
  }

  const withTitles = await Promise.all(
    runs.value.map(async (run) =>
      checkRunFactsOf(run, await titlesOf(context, run)),
    ),
  );

  return Result.ok({
    sha,
    runs: withTitles,
    statuses: statuses.value.map(commitStatusFactsOf),
    rounds: rounds.value.map(roundFactsOf),
  });
};

/** Whether a run's annotations are read: it completed without passing. */
export const readsAnnotations = (
  status: string,
  conclusion: string | undefined,
): boolean =>
  status === 'completed' &&
  conclusion !== 'success' &&
  conclusion !== 'neutral' &&
  conclusion !== 'skipped';

const CheckRunSchema = t.record({
  id: t.number(),
  name: t.string(),
  status: t.string(),
  conclusion: t.union([t.string(), t.nullType]),
  started_at: t.union([t.string(), t.nullType]),
  completed_at: t.union([t.string(), t.nullType]),
  html_url: t.union([t.string(), t.nullType]),
  check_suite: t.union([t.record({ id: t.number() }), t.nullType]),
});

type CheckRunJson = t.TypeOf<typeof CheckRunSchema>;

const CheckRunsSchema = t.record({ check_runs: t.array(CheckRunSchema) });

const CommitStatusSchema = t.record({
  context: t.string(),
  state: t.string(),
  target_url: t.union([t.string(), t.nullType]),
});

const CombinedStatusSchema = t.record({
  statuses: t.array(CommitStatusSchema),
});

const WorkflowRunSchema = t.record({
  id: t.number(),
  check_suite_id: t.number(),
  workflow_id: t.number(),
  status: t.union([t.string(), t.nullType]),
  run_started_at: t.union([t.string(), t.nullType]),
  head_branch: t.union([t.string(), t.nullType]),
});

const WorkflowRunsSchema = t.record({
  workflow_runs: t.array(WorkflowRunSchema),
});

const AnnotationsSchema = t.array(
  t.record({ title: t.union([t.string(), t.nullType]) }),
);

const titlesOf = async (
  context: ReadContext,
  run: CheckRunJson,
): Promise<Read<readonly string[]> | undefined> =>
  readsAnnotations(run.status, run.conclusion ?? undefined)
    ? Result.map(
        await restAllPages(
          context,
          `the annotations of ${run.name}`,
          `/check-runs/${run.id}/annotations`,
          AnnotationsSchema,
        ),
        (annotations) => annotations.map(({ title }) => title ?? ''),
      )
    : undefined;

const checkRunFactsOf = (
  run: CheckRunJson,
  annotationTitles: Read<readonly string[]> | undefined,
): CheckRunFacts =>
  ({
    name: run.name,
    status: run.status.toLowerCase(),
    conclusion: run.conclusion?.toLowerCase(),
    checkSuiteId: run.check_suite?.id ?? 0,
    id: run.id,
    startedAt: run.started_at ?? undefined,
    completedAt: run.completed_at ?? undefined,
    annotationTitles,
    url: run.html_url ?? '',
  }) as const;

const commitStatusFactsOf = (
  status: t.TypeOf<typeof CommitStatusSchema>,
): CommitStatusFacts =>
  ({
    context: status.context,
    state: status.state.toLowerCase(),
    url: status.target_url ?? undefined,
  }) as const;

const roundFactsOf = (
  run: t.TypeOf<typeof WorkflowRunSchema>,
): WorkflowRoundFacts =>
  ({
    checkSuiteId: run.check_suite_id,
    runId: run.id,
    workflowId: run.workflow_id,
    completed: run.status === 'completed',
    attemptStartedAt: run.run_started_at ?? undefined,
    headBranch: run.head_branch ?? '',
  }) as const;
