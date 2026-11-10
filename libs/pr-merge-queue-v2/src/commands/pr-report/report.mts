/**
 * The report `pr-report` prints, built from one snapshot and the decisions over
 * it (`spec/commands.md`, `pr-report`). Its JSON is v1's `PrReport`, field for
 * field, which the `/unblock-prs` skill reads; v2 fills each linked issue's
 * title and state, and adds each issue's `claim`.
 */

import {
  contextStates,
  hasLabel,
  instantOf,
  isRunning,
  labelNames,
  parseMergeAfter,
  PullRequestLabel,
  type ChecksSummary,
  type ClaimComment,
  type ContextState,
  type ForestNode,
  type IssueClaim,
  type IssueDecision,
  type IssueStartState,
  type Label,
  type PullRequestClaim,
  type PullRequestDecision,
  type QueueComment,
  type QueueDecision,
  type QueueOwner,
  type ReadError,
  type ReferenceStatus,
  type RepoRef,
  type SetAsideComment,
  type Snapshot,
} from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * The report over `snapshot`, or the first thing it needs that was not read:
 * the required contexts, the open pull requests and each one's checks and
 * closing issues, the merged ones and the open issues. A report with any of
 * them blank would print a guess as a fact.
 */
export const buildReport = (
  snapshot: Snapshot,
  decision: QueueDecision,
  options: Readonly<{
    nowEpochMs: number;
    mergedWithinDays: number;
    issuesLimit: number;
  }>,
): Result<PrReport, ReadError> => {
  const { repository } = snapshot;

  if (Result.isErr(snapshot.requirements)) {
    return snapshot.requirements;
  }

  if (Result.isErr(snapshot.merged)) {
    return snapshot.merged;
  }

  const issues = decision.issues;

  if (Result.isErr(issues)) {
    return issues;
  }

  const mut_entries: ReportEntry[] = [];

  for (const pr of decision.pullRequests) {
    const entry = entryOf(pr, options.nowEpochMs);

    if (Result.isErr(entry)) {
      return entry;
    }

    mut_entries.push(entry.value);
  }

  const { owner, name } = repository.repo;

  return Result.ok({
    repo: repository.repo,
    defaultBranch: repository.defaultBranch,
    generatedAt: instantOf(options.nowEpochMs),
    authenticated: snapshot.authenticated,
    required: snapshot.requirements.value.requiredContexts,
    entries: mut_entries,
    roots: decision.forest.roots,
    cycles: decision.forest.cycles,
    merged: snapshot.merged.value.map((pr) => ({
      number: pr.number,
      title: pr.title,
      author: pr.author,
      url: pr.url,
      headRef: pr.headRef,
      baseRef: pr.baseRef,
      mergedAt: pr.mergedAt,
      labels: pr.labels,
      // Merged, its issues are read from the body: no title, no state.
      linkedIssues: pr.closingIssues.map((number) => ({
        number,
        title: '',
        url: `https://github.com/${owner}/${name}/issues/${number}`,
        state: 'unknown' as const,
      })),
    })),
    mergedWithinDays: options.mergedWithinDays,
    issues: issues.value.map(issueOf),
    issuesLimit: options.issuesLimit,
  });
};

/** The counts the report leads with. */
export const summarize = (entries: readonly ReportEntry[]): Summary => {
  const count = (predicate: (entry: ReportEntry) => boolean): number =>
    entries.filter(predicate).length;

  return {
    open: entries.length,
    queued: count(({ labels }) =>
      hasLabel(labelNames(labels), PullRequestLabel.mergeQueued),
    ),
    draft: count(({ isDraft }) => isDraft),
    failing: count(({ checks }) => checks.verdict === 'failing'),
    behind: count(({ comparison }) => (comparison?.behindBy ?? 0) > 0),
  };
};

export type PrReport = Readonly<{
  repo: RepoRef;
  defaultBranch: string;
  /** When it was built, so that a stale report is told from a fresh one. */
  generatedAt: string;
  /** Whether a token was used, which decides how much is known. */
  authenticated: boolean;
  required: readonly string[];
  /** Every open pull request, lowest number first. */
  entries: readonly ReportEntry[];
  /** The merge order; a pull request on a cycle is in `cycles` instead. */
  roots: readonly ForestNode[];
  cycles: readonly (readonly number[])[];
  /** Merged within `mergedWithinDays`, newest first. */
  merged: readonly MergedEntry[];
  mergedWithinDays: number;
  /** The open issues, most recently updated first. */
  issues: readonly ReportIssue[];
  /** What that list is capped at, so that a full one says so. */
  issuesLimit: number;
}>;

export type ReportEntry = Readonly<{
  number: number;
  title: string;
  body: string;
  author: string;
  isDraft: boolean;
  labels: readonly Label[];
  /** Armed; `merge-queued` is the request, this is the mechanism. */
  autoMerge: boolean;
  headRef: string;
  headSha: string;
  baseRef: string;
  fromFork: boolean;
  url: string;
  updatedAt: string;
  /** `undefined` when it could not be read. */
  headCommittedAt: string | undefined;
  /** `undefined` when it could not be read. */
  comparison: Readonly<{ aheadBy: number; behindBy: number }> | undefined;
  /** What every context reported on the head, required or not. */
  reported: ReadonlyRecord<string, ContextState>;
  /** Whether anything on the head is still going, required or not. */
  checksRunning: boolean;
  linkedIssues: readonly LinkedIssue[];
  /** Every number the body declares, open or not. */
  mergeAfter: readonly number[];
  stackedOn: number | undefined;
  /** What the issues it closes add to its order, less what it declared. */
  inheritedMergeAfter: readonly number[];
  /** Open issues those issues name that nobody has started. */
  notStartedIssues: readonly number[];
  /** What is still open of the three above, and so holds it. */
  blockedBy: readonly number[];
  checks: ChecksSummary;
  /** The worker's set-aside comment; `undefined` when there is none or unread. */
  setAside: QueueComment<SetAsideComment> | undefined;
  /** A session's claim comment; `undefined` when there is none or unread. */
  claim: QueueComment<ClaimComment<PullRequestClaim>> | undefined;
  /** Who moves it next; `undefined` off the queue or when comments are unread. */
  owner: QueueOwner | undefined;
}>;

export type LinkedIssue = Readonly<{
  number: number;
  title: string;
  url: string;
  state: 'closed' | 'open' | 'unknown';
}>;

export type MergedEntry = Readonly<{
  number: number;
  title: string;
  author: string;
  url: string;
  headRef: string;
  baseRef: string;
  mergedAt: string;
  labels: readonly Label[];
  linkedIssues: readonly LinkedIssue[];
}>;

export type ReportIssue = Readonly<{
  number: number;
  title: string;
  author: string;
  url: string;
  labels: readonly Label[];
  createdAt: string;
  updatedAt: string;
  comments: number;
  /** What it waits for: its `Start-After:` and its "blocked by". */
  startAfter: readonly number[];
  /** A `Merge-After:` in its body, which an issue does not read. */
  misplacedMergeAfter: readonly number[];
  start: IssueStartState;
  /** What it waits for, in order, and where each stands. */
  named: readonly Readonly<{ number: number; status: ReferenceStatus }>[];
  /**
   * **New in v2** (#3233): the `start-issue` claim on it while it holds (an
   * expired `planned` one is left out); the report says who and how long ago.
   */
  claim: IssueClaim | undefined;
}>;

export type Summary = Readonly<{
  open: number;
  queued: number;
  draft: number;
  failing: number;
  behind: number;
}>;

/** `error`, saying which pull request it was read for. */
const onPull = (error: ReadError, number: number): ReadError =>
  ({ ...error, what: `${error.what}, for #${number}` }) as const;

const entryOf = (
  decided: PullRequestDecision,
  nowEpochMs: number,
): Result<ReportEntry, ReadError> => {
  const pr = decided.facts;

  if (Result.isErr(decided.checks)) {
    return Result.err(onPull(decided.checks.value, pr.number));
  }

  if (Result.isErr(pr.checks)) {
    return Result.err(onPull(pr.checks.value, pr.number));
  }

  if (Result.isErr(pr.closingIssues)) {
    return Result.err(onPull(pr.closingIssues.value, pr.number));
  }

  const comments = Result.isOk(decided.comments)
    ? decided.comments.value
    : undefined;

  return Result.ok({
    number: pr.number,
    title: pr.title,
    body: pr.body,
    author: pr.author,
    isDraft: pr.isDraft,
    labels: pr.labels,
    autoMerge: pr.autoMerge,
    headRef: pr.headRef,
    headSha: pr.headSha,
    baseRef: pr.baseRef,
    fromFork: pr.fromFork,
    url: pr.url,
    updatedAt: pr.updatedAt,
    headCommittedAt: Result.unwrapOkOr(pr.headCommittedAt, undefined),
    comparison: Result.unwrapOkOr(pr.comparison, undefined),
    // Classified again: the decision keeps only the verdict over the required
    // contexts, and this map is cheap beside the requests that read it.
    reported: Object.fromEntries(contextStates(pr.checks.value, nowEpochMs)),
    checksRunning: isRunning(pr.checks.value),
    linkedIssues: pr.closingIssues.value,
    mergeAfter: parseMergeAfter(pr.body),
    stackedOn: decided.stackedOn,
    inheritedMergeAfter: decided.inherited,
    notStartedIssues: decided.notStartedIssues,
    blockedBy: decided.blockedBy,
    checks: decided.checks.value,
    setAside: comments?.setAside,
    claim: comments?.claim,
    owner: Result.unwrapOkOr(decided.owner, undefined),
  });
};

const issueOf = (decided: IssueDecision): ReportIssue => {
  const issue = decided.facts;

  return {
    number: issue.number,
    title: issue.title,
    author: issue.author,
    url: issue.url,
    labels: issue.labels,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    comments: issue.commentCount,
    startAfter: decided.waitsFor,
    misplacedMergeAfter: parseMergeAfter(issue.body),
    start: decided.start,
    named: decided.named,
    claim: decided.claim,
  };
};
