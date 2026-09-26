// cspell:ignore unlabel

/** The shapes every module here passes around. */

import { type RulesetRequirements } from 'pr-report-core';
import * as t from 'ts-fortress';
import { type StrictPick } from 'ts-type-forge';

/** The fields read from `gh pr list` / `gh pr view`. */
export const PullRequestSchema = t.record({
  number: t.number(),
  title: t.string(),
  /** Where a `Merge-After:` declaration is read from. */
  body: t.string(),
  state: t.string(),
  headRefName: t.string(),
  headRefOid: t.string(),
  baseRefName: t.string(),
  isDraft: t.boolean(),
  mergeStateStatus: t.string(),
  autoMergeRequest: t.unknown(),
  labels: t.array(t.record({ name: t.string() })),
});

export type PullRequest = t.TypeOf<typeof PullRequestSchema>;

export const PullRequestListSchema = t.array(PullRequestSchema);

export type SkipReason =
  | 'already-in-base'
  | 'checks-failed'
  | 'not-merging'
  | 'push-failed'
  | 'rebase-failed'
  | 'unlabel-failed'
  | 'watch-timeout';

/**
 * Why a pull request is being left alone, and the state it was in at the
 * time. A record stops applying as soon as that state changes: a push to the
 * branch clears every reason, and every reason but `checks-failed` also
 * clears when the base moves. See `skipStillApplies`.
 */
export type SkipRecord = Readonly<{
  number: number;
  headSha: string;
  baseSha: string;
  reason: SkipReason;
  detail: string;
}>;

export type SkipRecords = ReadonlyMap<number, SkipRecord>;

/**
 * Pull request number → the head it was demoted at: the pull requests picked
 * last, after a watch saw them green and still open. See `demotions.mts`.
 */
export type Demotions = ReadonlyMap<number, string>;

/** What the ruleset asks of a review, read by `review.mts`. */
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

export type ChecksSummary = Readonly<{
  status: 'failed' | 'passed' | 'pending';
  failed: readonly string[];
  pending: readonly string[];
  /**
   * Required contexts with no check run on the head commit at all. GitHub
   * shows these as "Expected — waiting for status to be reported" and
   * `gh pr checks` does not list them, so they are found by subtracting what
   * has reported from what the ruleset requires.
   */
  missing: readonly string[];
  /** How many checks the verdict was reached over. */
  total: number;
}>;

/** What a survey knows before the declared merge order has been read. */
export type TriageBase = Readonly<{
  defaultBranch: string;
  baseSha: string;
  skipped: SkipRecords;
  demoted: Demotions;
  requiredContexts: readonly string[];
  reviewRequirements: ReviewRequirements;
}>;

export type TriageContext = TriageBase &
  Readonly<{
    /** The numbers of the pull requests that are open right now. */
    openNumbers: ReadonlySet<number>;
    /** What each pull request declared it must merge after. */
    dependencies: ReadonlyMap<number, readonly number[]>;
    /** Every number that sits on a `Merge-After` cycle. */
    cyclic: ReadonlySet<number>;
    /**
     * The open pull requests labelled `blocks-release`, which hold the
     * version pull request for as long as they are open.
     */
    releaseBlockers: readonly PullRequest[];
  }>;

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
   * on still open. Lowest number first.
   */
  candidates: readonly PullRequest[];
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
}>;

export type WatchOutcome =
  | 'auto-merge-disabled'
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
 * where the base was when it last looked, and how long the list has sat
 * still.
 */
export type LoopState = Readonly<{
  skipped: SkipRecords;
  demoted: Demotions;
  tracked: ReadonlySet<number>;
  baseSha: string | undefined;
  quiet: Quiet;
}>;

export type CycleResult = Readonly<{
  state: LoopState;
  next: 'idle' | 'stop' | 'survey';
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
    'already-in-base' | 'push-failed' | 'rebase-failed' | 'unlabel-failed';
  detail: string;
}>;
