/** The shapes every module here passes around. */

/** The repository being reported on. */
export type RepoRef = Readonly<{ owner: string; name: string }>;

/** What one context has reported on a head commit. */
export type ContextState = 'failed' | 'passed' | 'pending';

export type ChecksSummary = Readonly<{
  /**
   * `paused` is `skip-ci`: the gated jobs boot no runner and
   * `no-skip-ci-label` sits `pending` by design, so neither "pending" nor
   * "failing" describes it.
   */
  verdict: 'failing' | 'passed' | 'paused' | 'pending';
  failed: readonly string[];
  pending: readonly string[];
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
  labels: readonly string[];
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
  updatedAt: string;
  /** Undefined when the comparison could not be read. */
  comparison: Comparison | undefined;
  /** What every context reported on the head commit, required or not. */
  reported: ReadonlyMap<string, ContextState>;
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
}>;
