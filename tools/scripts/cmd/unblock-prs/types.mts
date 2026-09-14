// cspell:ignore unlabel

/** The shapes every module here passes around. */

import * as t from 'ts-fortress';

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

export type Survey = Readonly<{
  pullRequests: readonly PullRequest[];
  /** The tip of the default branch at the time of the survey. */
  baseSha: string;
  /** The contexts the ruleset requires, empty when they cannot be read. */
  requiredContexts: readonly string[];
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
  requiredContexts: readonly string[];
}>;

export type TriageContext = TriageBase &
  Readonly<{
    /** The numbers of the pull requests that are open right now. */
    openNumbers: ReadonlySet<number>;
    /** What each pull request declared it must merge after. */
    dependencies: ReadonlyMap<number, readonly number[]>;
    /** Every number that sits on a `Merge-After` cycle. */
    cyclic: ReadonlySet<number>;
  }>;

/** What one survey says about one pull request. */
export type Classification = Readonly<
  | { kind: 'candidate' }
  | { kind: 'failing'; summary: ChecksSummary }
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

/**
 * What one run carries from cycle to cycle: the pull requests it has given up
 * on, the ones it has acted on and last saw open, and where the base was when
 * it last looked.
 */
export type LoopState = Readonly<{
  skipped: SkipRecords;
  tracked: ReadonlySet<number>;
  baseSha: string | undefined;
}>;

export type CycleResult = Readonly<{
  state: LoopState;
  next: 'idle' | 'stop' | 'survey';
}>;

/** How far `advance` got with one pull request. */
export type Advanced = Readonly<
  { kind: 'advanced'; head: string } | { kind: 'stale-merge-state' }
>;

export type RebaseFailure = Readonly<{
  reason:
    'already-in-base' | 'push-failed' | 'rebase-failed' | 'unlabel-failed';
  detail: string;
}>;
