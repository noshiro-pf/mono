/**
 * The workflow runs on one commit, read the one way every REST reader reads
 * them (`GET /repos/{owner}/{repo}/actions/runs?head_sha=`), as the rounds
 * {@link statesFromCheckRuns} weighs check runs against.
 *
 * Nothing here talks to GitHub: the reader hands over its own way of asking.
 */

import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { BranchRulesGet } from './branch-rules.mjs';
import type { WorkflowRound } from './checks.mjs';

/**
 * Each check suite on `sha` that is a workflow run, to that run: its workflow,
 * whether it has finished, and when its latest attempt began — REST's
 * `run_started_at`, which a re-run sets anew. Every page or none: a map missing
 * half the suites would read as the whole.
 */
export const readWorkflowRounds = async (
  sha: string,
  get: BranchRulesGet,
): Promise<Result<ReadonlyMap<number, WorkflowRound>, string>> => {
  if (!SHA.test(sha)) {
    return Result.err(`${sha} is not a commit sha.`);
  }

  const mut_rounds = new Map<number, WorkflowRound>();

  for (const page of Arr.seq(MAX_PAGES)) {
    // One page after another, each by the count the one before gave: the list
    // is newest first, so a run created meanwhile pushes one onto the next
    // page, which a count read once would not ask for.
    // eslint-disable-next-line no-await-in-loop
    const answered = await get(
      `/actions/runs?head_sha=${sha}&per_page=${PAGE_SIZE}&page=${page + 1}`,
      WorkflowRunsSchema,
      `the workflow runs on ${sha}`,
    );

    if (Result.isErr(answered)) {
      return answered;
    }

    for (const run of answered.value.workflow_runs) {
      if (run.check_suite_id !== null) {
        mut_rounds.set(run.check_suite_id, roundOf(run));
      }
    }

    if (
      Arr.isEmpty(answered.value.workflow_runs) ||
      (page + 1) * PAGE_SIZE >= answered.value.total_count
    ) {
      return Result.ok(mut_rounds);
    }
  }

  return Result.err(
    `${sha} has more than ${PAGE_SIZE * MAX_PAGES} workflow runs, which is more than this reads.`,
  );
};

/**
 * One workflow run (`GET /repos/{owner}/{repo}/actions/runs/{run_id}`), as its
 * check suite and the round {@link readWorkflowRounds} would give it: what a
 * reader that knows the run of each red from its link asks instead of listing
 * every run on the commit.
 */
export const readWorkflowRound = async (
  runId: number,
  get: BranchRulesGet,
): Promise<
  Result<readonly [checkSuiteId: number, round: WorkflowRound], string>
> => {
  const answered = await get(
    `/actions/runs/${runId}`,
    WorkflowRunSchema,
    `workflow run ${runId}`,
  );

  if (Result.isErr(answered)) {
    return answered;
  }

  const run = answered.value;

  return run.check_suite_id === null
    ? Result.err(`workflow run ${runId} has no check suite.`)
    : Result.ok([run.check_suite_id, roundOf(run)] as const);
};

const roundOf = (run: t.TypeOf<typeof WorkflowRunSchema>): WorkflowRound =>
  ({
    workflowId: run.workflow_id,
    completed: run.status === 'completed',
    attemptStartedAt: run.run_started_at ?? undefined,
  }) as const;

const SHA = /^[0-9a-f]{40}$/u;

const PAGE_SIZE = 100;

const MAX_PAGES = 10;

const WorkflowRunSchema = t.record({
  check_suite_id: t.union([t.number(), t.nullType]),
  workflow_id: t.number(),
  status: t.union([t.string(), t.nullType]),
  run_started_at: t.union([t.string(), t.nullType]),
});

const WorkflowRunsSchema = t.record({
  total_count: t.number(),
  workflow_runs: t.array(WorkflowRunSchema),
});
