/**
 * What the worker reads again just before it acts (`spec/worker.md`,
 * "Picking"), and the writes it alone makes, over REST.
 */

import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { Read } from '../snapshot/index.mjs';
import { restGet, restWrite } from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * Pull request `number` as GitHub has it now: what arming and releasing are
 * re-read against, so that a decision acts on the state it was made from.
 */
export const readPullRequestNow = async (
  context: ReadContext,
  number: number,
): Promise<Read<PullRequestNow>> =>
  Result.map(
    await restGet(
      context,
      `pull request #${number}`,
      `/pulls/${number}`,
      t.record({
        state: t.string(),
        node_id: t.string(),
        head: t.record({ sha: t.string() }),
        base: t.record({ ref: t.string() }),
        labels: t.array(t.record({ name: t.string() })),
      }),
    ),
    (pull) => ({
      open: pull.state.toLowerCase() === 'open',
      nodeId: pull.node_id,
      headSha: pull.head.sha,
      baseRef: pull.base.ref,
      labels: pull.labels.map(({ name }) => name),
    }),
  );

/** Asks GitHub to run the failed jobs of workflow run `runId` again. */
export const rerunFailedJobs = async (
  context: ReadContext,
  runId: number,
): Promise<Read<undefined>> =>
  Result.map(
    await restWrite(
      context,
      `a re-run of run ${runId}'s failed jobs`,
      'POST',
      `/actions/runs/${runId}/rerun-failed-jobs`,
      undefined,
      t.unknown(),
    ),
    () => undefined,
  );

/** Cancels workflow run `runId`, one of a dropped queue layer's. */
export const cancelRun = async (
  context: ReadContext,
  runId: number,
): Promise<Read<undefined>> =>
  Result.map(
    await restWrite(
      context,
      `the cancel of run ${runId}`,
      'POST',
      `/actions/runs/${runId}/cancel`,
      undefined,
      t.unknown(),
    ),
    () => undefined,
  );

/**
 * Deletes workflow run `runId`, so that the gate reuses no verdict of it: a red
 * queue layer's, whose failures are left to Auto-fix on the pull request's own
 * run.
 */
export const deleteRun = async (
  context: ReadContext,
  runId: number,
): Promise<Read<undefined>> =>
  Result.map(
    await restWrite(
      context,
      `the delete of run ${runId}`,
      'DELETE',
      `/actions/runs/${runId}`,
      undefined,
      t.unknown(),
    ),
    () => undefined,
  );

/**
 * Dispatches `workflow`, a file of `.github/workflows/`, on branch `ref`, with
 * no inputs: on a `queue/*` branch the run diffs against the default branch, as
 * a pull request's does.
 */
export const dispatchWorkflow = async (
  context: ReadContext,
  workflow: string,
  ref: string,
): Promise<Read<undefined>> =>
  Result.map(
    await restWrite(
      context,
      `the dispatch of ${workflow} on ${ref}`,
      'POST',
      `/actions/workflows/${workflow}/dispatches`,
      { ref },
      t.unknown(),
    ),
    () => undefined,
  );

/** The tree of commit `sha`. */
export const readCommitTree = async (
  context: ReadContext,
  sha: string,
): Promise<Read<string>> =>
  Result.map(
    await restGet(
      context,
      `the commit ${sha.slice(0, 10)}`,
      `/git/commits/${sha}`,
      t.record({ tree: t.record({ sha: t.string() }) }),
    ),
    ({ tree }) => tree.sha,
  );

export type PullRequestNow = Readonly<{
  open: boolean;
  /** What a GraphQL mutation names it by. */
  nodeId: string;
  headSha: string;
  baseRef: string;
  labels: readonly string[];
}>;
