import {
  codeOwnerGate,
  codeOwnerReviewOf,
  codeOwnersEnforcedBy,
  contextStates,
  hasLabel,
  isRunning,
  labelNames,
  outsideCodeFences,
  parseCodeOwners,
  parseMergeAfter,
  PullRequestLabel,
  reviewStateOf,
  type ChecksVerdict,
  type ClosingIssue,
  type ContextState,
  type Label,
  type PullRequestDecision,
  type ReviewRules,
  type Snapshot,
} from 'pr-report-core-v2';
import { claudeSessionTrailersOf, claudeSessionUrlOf } from 'split-view-link';
import { Arr, Result } from 'ts-data-forge';
import { instantMsOf } from '../format.mjs';

/** Everything one card of the merge order draws (spec §7.2). */
export type MergeOrderCard = Readonly<{
  number: number;
  title: string;
  url: string;
  author: string;
  isDraft: boolean;
  priority: Priority;
  checks: ChecksBadge;
  autoMerge: boolean;
  codeOwner: CodeOwnerBadge | undefined;
  setAside: SetAsideBadge | undefined;
  /**
   * Who claimed it to fix, the session's address when it is a Claude Code
   * session's, and when (epoch milliseconds).
   */
  claim:
    | Readonly<{ by: string; sessionUrl: string | undefined; atMs: number }>
    | undefined;
  /** `skip-ci` on, on a queue repository. */
  paused: boolean;
  queued: boolean;
  pending: boolean;
  sessions: readonly ClaudeSession[];
  closingIssues: readonly ClosingIssue[];
  headRef: string;
  baseRef: string;
  stackedOn: number | undefined;
  comparison: Readonly<{ aheadBy: number; behindBy: number }> | undefined;
  /** Open pull requests its description says it merges after. */
  mergeAfter: readonly number[];
  /** Open pull requests it waits for through the issues it closes. */
  inherited: readonly number[];
  /** Open issues those issues name that no open pull request closes. */
  notStartedIssues: readonly number[];
  /** Epoch milliseconds; `undefined` when the head commit's date is unread. */
  pushedAtMs: number | undefined;
  updatedAtMs: number;
  labels: readonly Label[];
}>;

/** The priorities a `priority:*` label names, highest first. */
export const LABELLED_PRIORITIES = ['high', 'mid', 'low'] as const;

export type Priority = (typeof LABELLED_PRIORITIES)[number] | 'none';

/**
 * The checks verdict with its parts (`1✗ 1… 1– 6✓`), over the required
 * contexts, or over every reported one when the branch requires none.
 */
export type ChecksBadge = Readonly<
  | { kind: 'unread'; reason: string }
  | {
      kind: 'counts';
      verdict: ShownVerdict;
      failed: readonly string[];
      pending: readonly string[];
      skipped: readonly string[];
      passed: readonly string[];
      /** Whether the counts are of every reported context. */
      noneRequired: boolean;
    }
>;

/** GitHub's verdict, or `running` while anything on the head still runs. */
export type ShownVerdict = ChecksVerdict | 'running';

export type CodeOwnerBadge = Readonly<
  | { kind: 'waiting'; owners: readonly string[]; paths: readonly string[] }
  | { kind: 'bypass'; owners: readonly string[]; paths: readonly string[] }
  | { kind: 'unknown'; teams: readonly string[] }
>;

export type SetAsideBadge = Readonly<{
  reason: string;
  /** `false` once the base moved or a retry was asked: drawn grey. */
  applies: boolean;
}>;

/** A Claude Code session a `Claude-Session:` line names. */
export type ClaudeSession = Readonly<{
  title: string | undefined;
  url: string;
}>;

/**
 * The card of one decided pull request. `nowMs` dates the checks: a red of an
 * earlier attempt is held back while a re-run is young (#3474).
 */
export const cardOf = (
  decision: PullRequestDecision,
  snapshot: Snapshot,
  nowMs: number,
): MergeOrderCard => {
  const { facts } = decision;

  const names = labelNames(facts.labels);

  const queueRepository =
    Result.isOk(snapshot.repository.hasQueueLabel) &&
    snapshot.repository.hasQueueLabel.value;

  const open = new Set(
    Result.isOk(snapshot.pullRequests)
      ? snapshot.pullRequests.value.map(({ number }) => number)
      : [],
  );

  const comments = Result.isOk(decision.comments)
    ? decision.comments.value
    : undefined;

  const setAside = comments?.setAside;

  const claim = comments?.claim;

  return {
    number: facts.number,
    title: facts.title,
    url: facts.url,
    author: facts.author,
    isDraft: facts.isDraft,
    priority: priorityOf(names),
    checks: checksBadgeOf(decision, nowMs),
    autoMerge: facts.autoMerge,
    codeOwner: codeOwnerBadgeOf(decision, snapshot),
    setAside:
      setAside?.says.kind === 'standing'
        ? { reason: setAside.says.record.reason, applies: setAside.applies }
        : undefined,
    claim:
      claim?.says.kind === 'standing' && claim.applies
        ? {
            by: claim.says.claim.by,
            sessionUrl: claudeSessionUrlOf(claim.says.claim.by),
            atMs: instantMsOf(claim.says.claim.at),
          }
        : undefined,
    paused: queueRepository && hasLabel(names, PullRequestLabel.skipCi),
    queued: hasLabel(names, PullRequestLabel.mergeQueued),
    pending: hasLabel(names, PullRequestLabel.pending),
    sessions: claudeSessionsOf(facts.body),
    closingIssues: Result.isOk(facts.closingIssues)
      ? facts.closingIssues.value
      : [],
    headRef: facts.headRef,
    baseRef: facts.baseRef,
    stackedOn: decision.stackedOn,
    comparison: Result.isOk(facts.comparison)
      ? facts.comparison.value
      : undefined,
    mergeAfter: Arr.uniq(
      parseMergeAfter(facts.body).filter(
        (number) => open.has(number) && number !== facts.number,
      ),
    ),
    inherited: decision.inherited,
    notStartedIssues: decision.notStartedIssues,
    pushedAtMs: Result.isOk(facts.headCommittedAt)
      ? instantMsOf(facts.headCommittedAt.value)
      : undefined,
    updatedAtMs: instantMsOf(facts.updatedAt),
    labels: facts.labels,
  };
};

/**
 * `priority:high|mid|low`, or `none` with no priority label or several: an
 * author who put on two has said nothing the page can sort by.
 */
export const priorityOf = (labels: readonly string[]): Priority => {
  const found = LABELLED_PRIORITIES.filter((priority) =>
    hasLabel(labels, `priority:${priority}`),
  );

  return Arr.isFixedLengthArray(1, found) ? found[0] : 'none';
};

/**
 * The sessions a description names on `Claude-Session:` lines outside code
 * fences, once each: only Claude Code sessions' addresses, since the split view
 * opens them in a pane (`split-view-link` reads the lines).
 */
export const claudeSessionsOf = (body: string): readonly ClaudeSession[] =>
  claudeSessionTrailersOf(outsideCodeFences(body)).map(({ title, url }) => ({
    title: title === '' ? undefined : title,
    url,
  }));

/**
 * The review rules a card's code owner badge is judged by, worked out once per
 * snapshot: every card of a read asks, and parsing `CODEOWNERS` is not free.
 */
export const reviewRulesOf = (snapshot: Snapshot): ReviewRules | undefined => {
  if (rulesBySnapshot.has(snapshot)) {
    return rulesBySnapshot.get(snapshot);
  }

  const rules = reviewRulesFrom(snapshot);

  rulesBySnapshot.set(snapshot, rules);

  return rules;
};

const rulesBySnapshot = new WeakMap<Snapshot, ReviewRules | undefined>();

const reviewRulesFrom = (snapshot: Snapshot): ReviewRules | undefined => {
  const { requirements } = snapshot;

  const { codeOwners } = snapshot.repository;

  if (Result.isErr(requirements) || Result.isErr(codeOwners)) {
    return undefined;
  }

  const text = codeOwners.value ?? '';

  return {
    requireCodeOwnerReview: requirements.value.requireCodeOwnerReview,
    requireConversationResolution:
      requirements.value.requireConversationResolution,
    codeOwners: parseCodeOwners(text),
    codeOwnerGate: codeOwnerGate(
      requirements.value,
      codeOwnersEnforcedBy(text),
    ),
  };
};

const checksBadgeOf = (
  decision: PullRequestDecision,
  nowMs: number,
): ChecksBadge => {
  const { checks } = decision.facts;

  if (Result.isErr(checks)) {
    return { kind: 'unread', reason: checks.value.message };
  }

  if (Result.isErr(decision.checks)) {
    return { kind: 'unread', reason: decision.checks.value.message };
  }

  const summary = decision.checks.value;

  const running = isRunning(checks.value);

  const verdict =
    running && summary.verdict !== 'failing' && summary.verdict !== 'paused'
      ? 'running'
      : summary.verdict;

  if (summary.required > 0) {
    return {
      kind: 'counts',
      verdict,
      failed: summary.failed,
      pending: [...summary.pending, ...summary.missing],
      skipped: summary.skipped,
      passed: summary.passed,
      noneRequired: false,
    };
  }

  const states = contextStates(checks.value, nowMs);

  const withState = (state: ContextState): readonly string[] =>
    Array.from(states)
      .filter(([, s]) => s === state)
      .map(([name]) => name)
      .toSorted();

  // Nothing required: the reported contexts are all there is to go by.
  const failed = withState('failed');

  const pending = withState('pending');

  return {
    kind: 'counts',
    verdict: Arr.isNonEmpty(failed)
      ? 'failing'
      : running || Arr.isNonEmpty(pending)
        ? 'running'
        : summary.verdict,
    failed,
    pending,
    skipped: withState('skipped'),
    passed: withState('passed'),
    noneRequired: true,
  };
};

const codeOwnerBadgeOf = (
  decision: PullRequestDecision,
  snapshot: Snapshot,
): CodeOwnerBadge | undefined => {
  const rules = reviewRulesOf(snapshot);

  const { review, author } = decision.facts;

  if (rules === undefined || Result.isErr(review)) {
    return undefined;
  }

  const state = codeOwnerReviewOf(reviewStateOf(author, review.value), rules);

  switch (state.state) {
    case 'approved':
    case 'not-required':
      return undefined;

    case 'unknown':
      return { kind: 'unknown', teams: state.teams ?? [] };

    case 'required':
      return {
        kind: state.authorOwns ? 'bypass' : 'waiting',
        owners: state.owners,
        paths: state.paths,
      };
  }
};
