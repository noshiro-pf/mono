/**
 * What has reported on one head commit: its check runs, its commit statuses and
 * the workflow runs (rounds) its check suites belong to.
 */

import type { Read } from './read-result.mjs';

/** One check run. */
export type CheckRunFacts = Readonly<{
  name: string;
  /** `queued`, `in_progress`, `completed`, … as REST spells it, lower case. */
  status: string;
  /** Lower case; `undefined` until completed. */
  conclusion: string | undefined;
  /** The suite it belongs to; the greatest wins (`decisions.md`). */
  checkSuiteId: number;
  /** Ascending, so it orders two runs of one name inside one suite. */
  id: number;
  /** ISO 8601, once it has started. */
  startedAt: string | undefined;
  /** ISO 8601, once it has finished. */
  completedAt: string | undefined;
  /**
   * The titles of its annotations, at any level, for a run that completed
   * without passing; `undefined` for any other, whose annotations nothing
   * reads. Auto-fix declines a job one of whose titles is
   * `notFixableAnnotation` (its command failed, not a check finding something
   * to fix).
   */
  annotationTitles: Read<readonly string[]> | undefined;
  /** The run's page, for a link. */
  url: string;
}>;

/** One commit status, such as `no-skip-ci-label`. */
export type CommitStatusFacts = Readonly<{
  context: string;
  /**
   * `success`, `pending`, `failure` or `error`, lower case; GraphQL's
   * `expected` too, for a required status that has not reported yet.
   */
  state: string;
  url: string | undefined;
}>;

/** A workflow run, the round a check suite is. */
export type WorkflowRoundFacts = Readonly<{
  checkSuiteId: number;
  runId: number;
  workflowId: number;
  completed: boolean;
  /**
   * REST's `run_started_at`, which a re-run sets anew; `undefined` until the
   * run starts. GraphQL has no such field, so every reader reads the rounds
   * over REST.
   */
  attemptStartedAt: string | undefined;
  /**
   * The branch the run is of, as the run records it: whether it is a layer run
   * is decided from this (`isQueueLayerRun`), not by the reader.
   */
  headBranch: string;
}>;

export type HeadChecks = Readonly<{
  sha: string;
  /**
   * Every run of every name, superseded ones included (REST's `filter=all`):
   * which of two runs of one name counts is decided by `decisions.md`, not by
   * GitHub's `filter=latest`, which keeps the one completed last.
   */
  runs: readonly CheckRunFacts[];
  /**
   * The latest status of each context only, as GraphQL's rollup and REST's
   * combined status give it: a REST reader of every status ever set would hold
   * a context `pending` that went on to succeed.
   */
  statuses: readonly CommitStatusFacts[];
  /**
   * Every workflow run on the commit. A round a concurrency group holds has no
   * check run yet, so the runs alone do not show it.
   */
  rounds: readonly WorkflowRoundFacts[];
}>;
