// cspell:ignore unlabel retargeted

/** The shapes every module here passes around. */

import type {
  Claim,
  QueueContext,
  QueueOwner,
  RulesetRequirements,
  SetAsideComment,
  SetAsideReason,
  ChecksSummary as SharedChecksSummary,
} from 'pr-report-core';
import * as t from 'ts-fortress';
import type { StrictPick } from 'ts-type-forge';

/** The fields read of each pull request (`github.mts`'s `listPullRequests`). */
export const PullRequestSchema = t.record({
  number: t.number(),
  /** The node id, which the GraphQL mutation that arms auto-merge takes. */
  id: t.string(),
  title: t.string(),
  /** Where a `Merge-After:` declaration is read from. */
  body: t.string(),
  state: t.string(),
  headRefName: t.string(),
  headRefOid: t.string(),
  baseRefName: t.string(),
  /**
   * Whether the head branch lives in a fork. A fork's branch is never the
   * parent of a stack, and never pushed to when one is restacked.
   */
  isCrossRepository: t.boolean(),
  isDraft: t.boolean(),
  mergeStateStatus: t.string(),
  autoMergeRequest: t.unknown(),
  labels: t.array(t.record({ name: t.string() })),
});

export type PullRequest = t.TypeOf<typeof PullRequestSchema>;

export const PullRequestListSchema = t.array(PullRequestSchema);

/**
 * What moving a branch reads of its pull request, which `push-fixed-pr` fills
 * in from the REST API rather than from GraphQL.
 */
export type BranchOf = StrictPick<
  PullRequest,
  | 'baseRefName'
  | 'headRefName'
  | 'headRefOid'
  | 'isCrossRepository'
  | 'number'
  | 'state'
>;

/**
 * Why a pull request was set aside: `pr-report-core`'s list, where each
 * reason is given its owner (`queue-owner.mts`), so that a reason this
 * script writes is one every reader knows.
 */
export type SkipReason = SetAsideReason;

/**
 * Why a pull request is being left alone, and the state it was in at the
 * time. A record stops applying as soon as that state changes: a push to the
 * branch clears every reason, and every reason but `checks-failed` and
 * `awaiting-bypass` also clears when the base moves. `awaiting-bypass` is the
 * one that is not a failure: every required check is green on a pull request
 * nothing but a ruleset bypass will merge, and what is left is a person's
 * (`pr-report-core`'s `review-hold.mts`). See `skipStillApplies`.
 */
export type SkipRecord = Readonly<{
  number: number;
  headSha: string;
  baseSha: string;
  reason: SkipReason;
  /** One sentence, which the log says and the comment leads with. */
  detail: string;
  /** For `checks-failed`: each failed required check, with its run. */
  failedChecks?: ChecksSummary['failedRuns'];
  /** What the command that failed printed, which the comment folds away. */
  output?: string;
}>;

export type SkipRecords = ReadonlyMap<number, SkipRecord>;

/**
 * One of this account's set-aside comments on a pull request, and what it
 * says. `pr-report-core`'s `set-aside.mts` says what it is.
 */
export type OwnSetAsideComment = Readonly<{
  /** The REST id, which editing it takes. */
  databaseId: number;
  says: SetAsideComment;
}>;

/**
 * Pull request number → the head it was demoted at: the pull requests picked
 * last, after a watch saw them green and still open. See `demotions.mts`.
 */
export type Demotions = ReadonlyMap<number, string>;

/**
 * What the ruleset asks of a review, read by `pr-report-core`'s
 * `review-hold.mts`.
 */
export type ReviewRequirements = StrictPick<
  RulesetRequirements,
  'requireCodeOwnerReview' | 'requireConversationResolution'
>;

export type Survey = Readonly<{
  pullRequests: readonly PullRequest[];
  /** The tip of the default branch at the time of the survey. */
  baseSha: string;
  /** The contexts the ruleset requires, empty when they cannot be read. */
  requiredContexts: readonly string[];
  /** Nothing is required when the rules cannot be read. */
  reviewRequirements: ReviewRequirements;
}>;

/**
 * `pr-report-core`'s verdict over the required contexts — the one `pr-report`
 * and the page reach too — with what the worker reads besides.
 */
export type ChecksSummary = SharedChecksSummary &
  Readonly<{
    /**
     * {@link SharedChecksSummary.failed}, each with its run's link, which a
     * set-aside comment points at.
     */
    failedRuns: readonly Readonly<{ name: string; link: string }>[];
    /**
     * Checks on the head that have not finished and are not among `pending`,
     * mostly the jobs a required aggregate is still waiting on.
     */
    running: readonly string[];
  }>;

/** What a survey knows before the declared merge order has been read. */
export type TriageBase = Readonly<{
  defaultBranch: string;
  baseSha: string;
  skipped: SkipRecords;
  /** The claims that still hold their pull requests (`claims.mts`). */
  claimed: ReadonlyMap<number, Claim>;
  demoted: Demotions;
  requiredContexts: readonly string[];
  reviewRequirements: ReviewRequirements;
  /** What the issues the pull requests close add to the merge order. */
  issueOrder: IssueOrder;
}>;

/**
 * Which open issues each open pull request closes, and each such issue's
 * `Start-After:`, which the pull request closing it inherits as a merge
 * order (`docs/issue-start-after.md`).
 */
export type IssueOrder = Readonly<{
  closes: ReadonlyMap<number, readonly number[]>;
  startAfter: ReadonlyMap<number, readonly number[]>;
}>;

/**
 * What triage decides each pull request against: the survey, and what the
 * open pull requests say about one another (`pr-report-core`'s
 * `queue-order.mts`).
 */
export type TriageContext = TriageBase & QueueContext;

/** What one survey says about one pull request. */
export type Classification = Readonly<
  | { kind: 'candidate' }
  | { kind: 'failing'; summary: ChecksSummary }
  | { kind: 'held'; reason: string }
  | { kind: 'ignore' }
  | { kind: 'in-flight' }
  | { kind: 'note'; note: string }
>;

export type Failing = Readonly<{ pr: PullRequest; summary: ChecksSummary }>;

export type Triage = Readonly<{
  /** How many of the surveyed pull requests this script has anything to say about. */
  inScope: number;
  /**
   * The queued pull requests this cycle may act on — behind the base, or
   * paused by `skip-ci`, or both — with nothing they declared `Merge-After`
   * on still open, and on the default branch rather than stacked. Lowest
   * number first.
   */
  candidates: readonly PullRequest[];
  /**
   * The candidates and the pull requests in flight that have no auto-merge
   * yet, which this script arms when it picks them. See `armOnPick` in
   * `rebase.mts`.
   */
  toArm: ReadonlySet<number>;
  /** Which open pull request each stacked one is on: child → parent. */
  stackParents: ReadonlyMap<number, number>;
  /**
   * The candidates and the pull requests in flight that only a ruleset bypass
   * will merge, with why (`pr-report-core`'s `review-hold.mts`): their checks
   * are run all the same, and they are never armed.
   */
  bypass: ReadonlyMap<number, string>;
  /** Up to date with checks still running, or clean and about to merge. */
  inFlight: readonly PullRequest[];
  /** Up to date, but a required check has failed. */
  failing: readonly Failing[];
  /**
   * Queued pull requests that would have been picked or watched but for
   * their review — an owner's approval or a conversation still open — each
   * as a note like the ones below.
   */
  held: readonly string[];
  /** Everything else, with the reason it was set aside. */
  notes: readonly string[];
  /** The `Merge-After` cycles, each starting at its lowest number. */
  cycles: readonly (readonly number[])[];
  /**
   * Who moves each queued pull request next (`owner.mts`), the same answer
   * `pr-report` gives the skill. "3a" moves only the worker's.
   */
  owners: ReadonlyMap<number, QueueOwner>;
}>;

/**
 * One change of a pull request's base, from its timeline. `stack.mts` reads
 * the last of them to tell which branch GitHub moved a layer off.
 */
export type BaseChange = Readonly<{ from: string; to: string }>;

export type WatchOutcome =
  | 'auto-merge-disabled'
  | 'awaiting-bypass'
  | 'behind-again'
  | 'checks-failed'
  | 'closed'
  | 'error'
  | 'head-moved'
  | 'merged'
  | 'not-merging'
  | 'stopped'
  | 'timeout'
  | 'skip-ci-labelled';

/**
 * How a watch ended, and for an outcome that sets the pull request aside,
 * what its comment says: `detail` and, when checks failed, which.
 */
export type Watched = Readonly<{
  outcome: WatchOutcome;
  detail?: string;
  failedChecks?: ChecksSummary['failedRuns'];
}>;

/**
 * Pull request number → the branch it was last seen stacked on: every layer
 * of a stack, and one whose parent has left the open list while GitHub has
 * yet to move it off that parent's branch. A layer that leaves this map by
 * landing on the default branch is one `stack.mts` may have to rebase off
 * the layer that merged below it.
 */
export type StackedOn = ReadonlyMap<number, string>;

/**
 * A pull request on the default branch that may have been moved there when
 * the layer below it merged: `from` is that layer's branch, or `undefined`
 * when it has to be read from the pull request's timeline.
 */
export type RetargetedLayer = Readonly<{
  pr: PullRequest;
  from: string | undefined;
}>;

/** What the loop remembers about how long the list has sat still. */
export type Quiet = Readonly<{
  /** The last survey's fingerprint; none before any survey has succeeded. */
  fingerprint: string | undefined;
  /** How many surveys in a row have seen what the one before them saw. */
  unchanged: number;
}>;

/**
 * What one run carries from cycle to cycle: the pull requests it has given up
 * on, the ones it picks last, the ones it has acted on and last saw open,
 * where the base was when it last looked, how long the list has sat still,
 * and which pull requests were stacked on what.
 */
export type LoopState = Readonly<{
  skipped: SkipRecords;
  demoted: Demotions;
  tracked: ReadonlySet<number>;
  baseSha: string | undefined;
  quiet: Quiet;
  /** `undefined` until the first survey, which has nothing to compare with. */
  stackedOn: StackedOn | undefined;
}>;

export type CycleResult = Readonly<{
  state: LoopState;
  next: 'idle' | 'stop' | 'survey';
  /**
   * The records the cycle acted from — what it carried over, less what no
   * longer applied, plus what the comments on the pull requests said. A
   * record in `state` that is not among these, or differs from its entry, is
   * one this cycle set aside, and the one its comment has to say.
   */
  settled: SkipRecords;
}>;

/**
 * How far `advance` got with one pull request. `moved` is the branch moving
 * under it — someone else, the skill or a person, is taking that pull
 * request forward — which is neither progress nor a failure of the pull
 * request.
 */
export type Advanced = Readonly<
  | { kind: 'advanced'; head: string }
  | { kind: 'moved' }
  | { kind: 'stale-merge-state' }
>;

/**
 * What `autoFix` did about a failed head. `declined` covers everything that
 * is not a fixer's diff and everything that went wrong on the way; either way
 * the failure stands and is the skill's. `moved` is what it is for `advance`.
 */
export type AutoFixed = Readonly<
  | { kind: 'declined'; detail: string }
  | { kind: 'moved' }
  | { kind: 'pushed'; head: string; commands: readonly string[] }
>;

export type RebaseFailure = Readonly<{
  reason:
    | 'already-in-base'
    | 'arm-failed'
    | 'push-failed'
    | 'rebase-failed'
    | 'unlabel-failed';
  detail: string;
  /** What the command that failed printed, when there is more than `detail`. */
  output?: string;
}>;

/**
 * What `advance` is asked to do besides the rebase: arm auto-merge, and carry
 * the layers stacked on it along.
 */
export type AdvancePlan = Readonly<{
  arm: boolean;
  /** Every open layer above it, each after the one it is on. */
  descendants: readonly PullRequest[];
}>;
