// cspell:ignore unlabel

/** The shapes every module here passes around. */

import * as t from 'ts-fortress';

/** The fields read from `gh pr list` / `gh pr view`. */
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

export type SkipReason =
  | 'already-in-base'
  | 'arm-failed'
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
  /** Where the set-aside status's "Details" leads, when there is a page for it. */
  link?: string;
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
  /** With the run's link, which is what a set-aside status points at. */
  failed: readonly Readonly<{ name: string; link: string }>[];
  pending: readonly string[];
  /**
   * Required contexts with no check run on the head commit at all. GitHub
   * shows these as "Expected — waiting for status to be reported" and
   * `gh pr checks` does not list them, so they are found by subtracting what
   * has reported from what the ruleset requires.
   */
  missing: readonly string[];
  /**
   * Checks on the head that have not finished and are not among `pending`,
   * mostly the jobs a required aggregate is still waiting on.
   */
  running: readonly string[];
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
    /**
     * What each pull request must merge after: what it declared, and the one
     * it is stacked on.
     */
    dependencies: ReadonlyMap<number, readonly number[]>;
    /** Which open pull request each stacked one is on: child → parent. */
    stackParents: ReadonlyMap<number, number>;
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
   * yet, which this script arms when it picks them. See `auto-merge.mts`.
   */
  toArm: ReadonlySet<number>;
  /** Which open pull request each stacked one is on: child → parent. */
  stackParents: ReadonlyMap<number, number>;
  /** Up to date with checks still running, or clean and about to merge. */
  inFlight: readonly PullRequest[];
  /** Up to date, but a required check has failed. */
  failing: readonly Failing[];
  /** Everything else, with the reason it was set aside. */
  notes: readonly string[];
  /** The `Merge-After` cycles, each starting at its lowest number. */
  cycles: readonly (readonly number[])[];
}>;

/**
 * What a pull request's timeline says about its base, its auto-merge and its
 * being queued, in the order it happened. `stack.mts` reads the base changes
 * and `auto-merge.mts` the rest.
 */
export type TimelineEvent = Readonly<
  | { kind: 'auto-merge-disabled'; manually: boolean }
  | { kind: 'auto-merge-enabled' }
  | { kind: 'base-changed'; from: string; to: string }
  | { kind: 'queued' }
>;

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
 * How a watch ended, and for an outcome that sets the pull request aside,
 * what its status says: `detail` and, where there is a page for it, `link`.
 */
export type Watched = Readonly<{
  outcome: WatchOutcome;
  detail?: string;
  link?: string;
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
 * on, the ones it has acted on and last saw open, where the base was when it
 * last looked, and how long the list has sat still.
 */
export type LoopState = Readonly<{
  skipped: SkipRecords;
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

export type RebaseFailure = Readonly<{
  reason:
    | 'already-in-base'
    | 'arm-failed'
    | 'push-failed'
    | 'rebase-failed'
    | 'unlabel-failed';
  detail: string;
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
