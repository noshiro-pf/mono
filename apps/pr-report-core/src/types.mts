// cspell:ignore RRGGBB

/**
 * The shapes a report is made of, whichever side reads GitHub for it:
 * `pr-report` over REST, the Pull Requests Manager page over GraphQL.
 */

/** The repository being reported on. */
export type RepoRef = Readonly<{ owner: string; name: string }>;

/**
 * What one context has reported on a head commit.
 *
 * `skipped` is its own state rather than a kind of `passed`. GitHub counts a
 * skip as met, and so does the verdict — but once the two are one word a
 * reader cannot tell them apart, and the aggregate that skipped may be from a
 * round that was superseded by one about to fail.
 */
export type ContextState = 'failed' | 'passed' | 'pending' | 'skipped';

export type ChecksSummary = Readonly<{
  /**
   * `paused` is `skip-ci`: the gated jobs boot no runner and
   * `no-skip-ci-label` sits `pending` by design, so neither "pending" nor
   * "failing" describes it.
   */
  verdict: 'failing' | 'passed' | 'paused' | 'pending';
  /**
   * Every required context by what it reported. These four and
   * {@link ChecksSummary.missing} are disjoint and cover the required list.
   */
  passed: readonly string[];
  failed: readonly string[];
  pending: readonly string[];
  skipped: readonly string[];
  /**
   * Required contexts with nothing reported on the head commit at all.
   * GitHub shows these as "Expected — waiting for status to be reported":
   * absent from the check list rather than pending in it.
   */
  missing: readonly string[];
  /** How many contexts the verdict was reached over. */
  required: number;
}>;

/** Commits the head has that the base does not, and the other way round. */
export type Comparison = Readonly<{ aheadBy: number; behindBy: number }>;

/** A label as GitHub holds it: the name, and what it looks like. */
export type Label = Readonly<{
  name: string;
  /** `RRGGBB`, no leading `#`, exactly as the API sends it. */
  color: string;
  description: string;
}>;

export type LinkedIssue = Readonly<{
  number: number;
  /** Empty when the issue was read from the body without a token. */
  title: string;
  url: string;
  state: 'closed' | 'open' | 'unknown';
}>;

/** Everything read about one pull request, before anything is decided. */
export type PullRequestFacts = Readonly<{
  number: number;
  title: string;
  /** Where `Merge-After:` and the closing keywords are read from. */
  body: string;
  author: string;
  isDraft: boolean;
  labels: readonly Label[];
  /**
   * Whether auto-merge is armed. Separate from `merge-queued`, which is the
   * author saying a pull request is to be landed: the label is the request
   * and this is the mechanism, and `unblock-prs` passes over a pull request
   * that has the one without the other.
   */
  autoMerge: boolean;
  headRef: string;
  headSha: string;
  baseRef: string;
  url: string;
  /**
   * When anything about the pull request last changed — a label, a comment,
   * an edit — which is why it is not {@link PullRequestFacts.headCommittedAt}.
   */
  updatedAt: string;
  /**
   * When the head commit was made, which is when the branch was last pushed
   * to as nearly as GitHub records it. Undefined when it could not be read.
   */
  headCommittedAt: string | undefined;
  /** Undefined when the comparison could not be read. */
  comparison: Comparison | undefined;
  /** What every context reported on the head commit, required or not. */
  reported: ReadonlyMap<string, ContextState>;
  /**
   * Whether any check run on the head commit has not finished, required or
   * not. See `anyRunInProgress` for why the required ones are not enough.
   */
  checksRunning: boolean;
  linkedIssues: readonly LinkedIssue[];
}>;

export type ReportEntry = PullRequestFacts &
  Readonly<{
    /** Every number the body declared, whether or not it is still open. */
    mergeAfter: readonly number[];
    /** The subset of it that is still open, and so still constrains. */
    blockedBy: readonly number[];
    checks: ChecksSummary;
  }>;

/**
 * One pull request in the merge order. `repeated` marks the second and later
 * appearances of a pull request that declared more than one predecessor: it
 * is drawn under each of them, but expanded under the first only.
 */
export type TreeNode = Readonly<{
  number: number;
  repeated: boolean;
  children: readonly TreeNode[];
}>;

/**
 * One pull request that has already landed, for the section that says what
 * shipped. Nothing that is true of an open pull request — a merge order, a
 * check verdict, a distance from its base — is true of one that has merged,
 * so it is its own shape rather than an entry with the fields blanked.
 */
export type MergedPullRequest = Readonly<{
  number: number;
  title: string;
  author: string;
  url: string;
  headRef: string;
  baseRef: string;
  mergedAt: string;
  labels: readonly Label[];
  /** Read from the body: GitHub's own list is only served for open ones. */
  linkedIssues: readonly LinkedIssue[];
}>;

/**
 * One open issue. Its own shape rather than a pull request's with fields
 * blanked: an issue has no branch, no checks and no place in a merge order.
 */
export type OpenIssue = Readonly<{
  number: number;
  title: string;
  author: string;
  url: string;
  labels: readonly Label[];
  createdAt: string;
  updatedAt: string;
  comments: number;
}>;

/** The counts a report leads with. */
export type Summary = Readonly<{
  open: number;
  /** Labelled `merge-queued`: the author saying it is to be landed. */
  queued: number;
  draft: number;
  failing: number;
  /** Behind the base, which the ruleset refuses to merge. */
  behind: number;
}>;

export type PrReport = Readonly<{
  repo: RepoRef;
  /** ISO 8601, so that a reader can tell a stale report from a fresh one. */
  generatedAt: string;
  /** Whether a token was used, which is what decides how much is known. */
  authenticated: boolean;
  required: readonly string[];
  /** Every open pull request, lowest number first. */
  entries: readonly ReportEntry[];
  /** The merge order, as a forest. Pull requests on a cycle are not in it. */
  roots: readonly TreeNode[];
  cycles: readonly (readonly number[])[];
  /** Merged within {@link PrReport.mergedWithinDays}, newest first. */
  merged: readonly MergedPullRequest[];
  /** How far back that list goes. */
  mergedWithinDays: number;
  /** The open issues, most recently updated first. */
  issues: readonly OpenIssue[];
  /** What that list is capped at, so that a full one can say so. */
  issuesLimit: number;
}>;
