/**
 * Every decision over one snapshot, composed the one way the page, `pr-report`
 * and the worker all read it: the merge graph, each open pull request's checks,
 * records, owner and standing, the order candidates are picked in, and each
 * open issue's start state.
 */

import { Arr, Result } from 'ts-data-forge';
import {
  findRecord,
  hasLabel,
  parseIssueClaimComment,
  PullRequestLabel,
  type ClaimComment,
  type IssueClaim,
} from '../conventions/index.mjs';
import type {
  IssueFacts,
  PullRequestFacts,
  Read,
  ReadError,
  ReferenceFacts,
  Snapshot,
} from '../snapshot/index.mjs';
import { judgeChecks, type ChecksSummary } from './checks.mjs';
import {
  codeOwnerGate,
  codeOwnersEnforcedBy,
  parseCodeOwners,
} from './code-owners.mjs';
import {
  buildForest,
  mergeGraph,
  openDependenciesOf,
  type Forest,
  type InheritanceUnread,
  type MergeGraph,
} from './graph.mjs';
import {
  decideStartStates,
  heldIssueClaim,
  issuesInProgress,
  issueStatusOf,
  progressOf,
  referenceStatusOf,
  waitsFor,
  withProgress,
  type IssueStartState,
  type ReferenceStatus,
} from './issues.mjs';
import { queueOwner, type QueueOwner } from './owner.mjs';
import {
  reviewHold,
  reviewStateOf,
  type ReviewHold,
  type ReviewRules,
} from './review-hold.mjs';
import { readQueueComments, type QueueComments } from './set-aside.mjs';
import {
  asksReview,
  orderCandidates,
  queueStanding,
  withReviewHold,
  type QueueStanding,
} from './standing.mjs';

/**
 * Every decision over `snapshot` at `nowEpochMs`. Unread when the open pull
 * requests are: an empty list would read as a queue with nothing in it.
 * `demoted` is the worker's memory of pull requests it saw green and not
 * merging; a reader without one passes an empty set.
 */
export const decideQueue = (
  snapshot: Snapshot,
  options: Readonly<{
    nowEpochMs: number;
    demoted: ReadonlySet<number>;
  }>,
): Read<QueueDecision> => {
  if (Result.isErr(snapshot.pullRequests)) {
    return snapshot.pullRequests;
  }

  const pulls = snapshot.pullRequests.value;

  const { defaultBranch, defaultBranchTip } = snapshot.repository;

  const { nowEpochMs } = options;

  const closes = new Map(pulls.map((pr) => [pr.number, closesOf(pr)] as const));

  const labelsOf = new Map(
    pulls.map((pr) => [pr.number, labelNames(pr.labels)] as const),
  );

  const namesOf = (pr: PullRequestFacts): readonly string[] =>
    labelsOf.get(pr.number) ?? labelNames(pr.labels);

  const issueBodies = issueBodiesOf(snapshot);

  const startAfterOf = new Map(
    Array.from(issueBodies.values(), (issue) => [
      issue.number,
      waitsForOf(issue),
    ]),
  );

  const graph = mergeGraph(
    pulls.map((pr) => ({
      number: pr.number,
      body: pr.body,
      isDraft: pr.isDraft,
      labels: namesOf(pr),
      headRef: pr.headRef,
      baseRef: pr.baseRef,
      fromFork: pr.fromFork,
      closes: closes.get(pr.number) ?? [],
    })),
    defaultBranch,
    startAfterOf,
    new Set(openIssueNumbersOf(snapshot)),
    inheritanceUnreadOf(snapshot, pulls, issueBodies),
  );

  const reviewRules = reviewRulesOf(snapshot);

  const inheritanceOf = (pr: PullRequestFacts): Read<readonly number[]> => {
    const error = graph.inheritanceUnread.get(pr.number);

    return error === undefined
      ? Result.ok(graph.inherited.get(pr.number) ?? [])
      : Result.err(error);
  };

  const decided = pulls.map((pr): PullRequestDecision => {
    const labels = namesOf(pr);

    const blockedBy = openDependenciesOf(graph, pr.number);

    const stackedOn = graph.stackParents.get(pr.number);

    const { requirements } = snapshot;

    const checks = Result.isErr(requirements)
      ? requirements
      : Result.map(pr.checks, (head) =>
          judgeChecks({
            required: requirements.value.requiredContexts,
            checks: head,
            paused: hasLabel(labels, PullRequestLabel.skipCi),
            baseCovered: pr.baseRef === defaultBranch,
            nowMs: nowEpochMs,
          }),
        );

    const comments = Result.map(pr.comments, (own) =>
      readQueueComments(own, {
        headSha: pr.headSha,
        baseTip: defaultBranchTip,
        nowEpochMs,
      }),
    );

    const owner = Result.map(comments, (read) =>
      queueOwner({
        labels,
        isDraft: pr.isDraft,
        fromFork: pr.fromFork,
        headRef: pr.headRef,
        headSha: pr.headSha,
        baseRef: pr.baseRef,
        defaultBranch,
        stackedOn,
        inCycle: graph.cyclic.has(pr.number),
        setAside: read.setAside?.says,
        claim: read.claim?.says,
        nowEpochMs,
      }),
    );

    const before = queueStanding(
      {
        number: pr.number,
        labels,
        isDraft: pr.isDraft,
        headRef: pr.headRef,
        baseRef: pr.baseRef,
        mergeState: pr.mergeState,
        autoMerge: pr.autoMerge,
        nativeStack: pr.nativeStack,
        containsBaseTip: Result.map(
          pr.comparison,
          ({ behindBy }) => behindBy === 0,
        ),
        checksFailed: Result.map(checks, ({ failed }) =>
          Arr.isNonEmpty(failed),
        ),
        owner,
        inheritance: inheritanceOf(pr),
      },
      { ...graph, defaultBranch },
    );

    const review = asksReview(before, pr.mergeState)
      ? holdOf(pr, reviewRules)
      : undefined;

    return {
      facts: pr,
      blockedBy,
      stackedOn,
      inherited: graph.inherited.get(pr.number) ?? [],
      notStartedIssues: graph.notStarted.get(pr.number) ?? [],
      checks,
      comments,
      owner,
      review,
      // A released pull request stays in flight with its review unread, so that
      // nothing is released beside it; only a candidate's turns on it.
      standing:
        review === undefined
          ? before
          : Result.isErr(review)
            ? before.kind === 'candidate'
              ? { kind: 'unread', error: review.value }
              : before
            : withReviewHold(before, pr.mergeState, review.value),
    };
  });

  const bypass = new Set(
    Arr.generate(function* () {
      for (const { facts, review } of decided) {
        if (
          review !== undefined &&
          Result.isOk(review) &&
          review.value?.kind === 'bypass'
        ) {
          yield facts.number;
        }
      }
    }),
  );

  return Result.ok({
    graph,
    forest: buildForest(
      decided.map(({ facts, blockedBy }) => ({
        number: facts.number,
        mergeAfter: blockedBy,
      })),
    ),
    pullRequests: decided,
    candidates: orderCandidates(
      decided.filter(({ standing }) => standing.kind === 'candidate'),
      ({ facts }) => ({
        number: facts.number,
        labels: namesOf(facts),
        headRef: facts.headRef,
        mergeState: facts.mergeState,
      }),
      {
        defaultBranch,
        demoted: ({ facts }) => options.demoted.has(facts.number),
        bypass: ({ facts }) => bypass.has(facts.number),
      },
    ).map(({ facts }) => facts.number),
    issues: decideIssues(snapshot, pulls, closes, nowEpochMs),
  });
};

/** The names of `labels`, which every decision reads labels by. */
export const labelNames = (
  labels: readonly Readonly<{ name: string }>[],
): readonly string[] => labels.map(({ name }) => name);

/** What was decided about one open pull request. */
export type PullRequestDecision = Readonly<{
  facts: PullRequestFacts;
  /** Open pull requests it still waits for: stack, declared and inherited. */
  blockedBy: readonly number[];
  stackedOn: number | undefined;
  /** What it inherits from the issues it closes, less what it declared. */
  inherited: readonly number[];
  /** Open issues named by those issues that nothing has started. */
  notStartedIssues: readonly number[];
  checks: Read<ChecksSummary>;
  comments: Read<QueueComments>;
  /** `undefined` for one the queue does not cover. */
  owner: Read<QueueOwner | undefined>;
  /** Read only where the standing asks the review; otherwise `undefined`. */
  review: Read<ReviewHold | undefined> | undefined;
  standing: QueueStanding;
}>;

/** What was decided about one open issue. */
export type IssueDecision = Readonly<{
  facts: IssueFacts;
  /** What it waits for: `Start-After:` and "blocked by". */
  waitsFor: readonly number[];
  start: IssueStartState;
  named: readonly Readonly<{ number: number; status: ReferenceStatus }>[];
  /**
   * The token's account's `start-issue` claim on it while it holds, as `start`
   * counts it; `undefined` when there is none, it has lapsed, or the comments
   * are unread.
   */
  claim: IssueClaim | undefined;
  /**
   * Why `start` may be wrong, if it may: its "blocked by" unread (`waitsFor` is
   * then its `Start-After:` alone), its comments unread (a claim is not seen),
   * a named number outside the lists unread (it reads `unknown`), or an open
   * pull request's closing issues unread (one may be working on it).
   */
  unread: ReadError | undefined;
}>;

export type QueueDecision = Readonly<{
  graph: MergeGraph;
  forest: Forest;
  pullRequests: readonly PullRequestDecision[];
  /** The candidates, in the order the worker picks them. */
  candidates: readonly number[];
  issues: Read<readonly IssueDecision[]>;
}>;

/**
 * The issues a pull request closes that may still declare an order: any not
 * known to be closed. Unread, it closes nothing the graph can see.
 */
const closesOf = (pr: PullRequestFacts): readonly number[] =>
  Result.isErr(pr.closingIssues)
    ? ([] as const)
    : pr.closingIssues.value
        .filter(({ state }) => state !== 'closed')
        .map(({ number }) => number);

/**
 * The open issues read, by number: the list, and those outside it an open pull
 * request closes or a declaration names.
 */
const openIssueNumbersOf = (snapshot: Snapshot): readonly number[] =>
  [
    ...(Result.isOk(snapshot.openIssues)
      ? snapshot.openIssues.value.issues.map(({ number }) => number)
      : ([] as const)),
    ...(Result.isOk(snapshot.otherIssues)
      ? Array.from(snapshot.otherIssues.value.values())
          .filter(({ state }) => state.toLowerCase() === 'open')
          .map(({ number }) => number)
      : ([] as const)),
  ] as const;

/** Every issue whose body was read, open or closed, by number. */
const issueBodiesOf = (snapshot: Snapshot): ReadonlyMap<number, IssueFacts> =>
  new Map<number, IssueFacts>([
    ...(Result.isOk(snapshot.otherIssues)
      ? Array.from(snapshot.otherIssues.value)
      : []),
    ...(Result.isOk(snapshot.openIssues)
      ? snapshot.openIssues.value.issues.map(
          (issue) => [issue.number, issue] as const,
        )
      : []),
  ]);

/**
 * What an issue waits for. "Blocked by" unread counts as none, since the body
 * still says what the author wrote; the issue's own decision says so.
 */
const waitsForOf = (issue: IssueFacts): readonly number[] =>
  waitsFor(
    issue.body,
    Result.isOk(issue.blockedBy) ? issue.blockedBy.value : [],
  );

/** The review rules, unread when the requirements or `CODEOWNERS` are. */
const reviewRulesOf = (snapshot: Snapshot): Read<ReviewRules> => {
  const { requirements } = snapshot;

  const { codeOwners } = snapshot.repository;

  if (Result.isErr(requirements)) {
    return requirements;
  }

  if (Result.isErr(codeOwners)) {
    return codeOwners;
  }

  const text = codeOwners.value ?? '';

  return Result.ok({
    requireCodeOwnerReview: requirements.value.requireCodeOwnerReview,
    requireConversationResolution:
      requirements.value.requireConversationResolution,
    codeOwners: parseCodeOwners(text),
    codeOwnerGate: codeOwnerGate(
      requirements.value,
      codeOwnersEnforcedBy(text),
    ),
  });
};

const holdOf = (
  pr: PullRequestFacts,
  rules: Read<ReviewRules>,
): Read<ReviewHold | undefined> =>
  Result.isErr(rules)
    ? rules
    : Result.map(pr.review, (review) =>
        reviewHold(reviewStateOf(pr.author, review), rules.value),
      );

/** What {@link mergeGraph} is told it could not read of the inheritance. */
const inheritanceUnreadOf = (
  snapshot: Snapshot,
  pulls: readonly PullRequestFacts[],
  issueBodies: ReadonlyMap<number, IssueFacts>,
): InheritanceUnread =>
  ({
    closes: new Map<number, ReadError>(
      Arr.generate(function* () {
        for (const { number, closingIssues } of pulls) {
          if (Result.isErr(closingIssues)) {
            yield [number, closingIssues.value] as const;
          }
        }
      }),
    ),
    waits: new Map<number, ReadError>(
      Arr.generate(function* () {
        for (const { number, blockedBy } of issueBodies.values()) {
          if (Result.isErr(blockedBy)) {
            yield [number, blockedBy.value] as const;
          }
        }
      }),
    ),
    bodies: [snapshot.openIssues, snapshot.otherIssues].find(Result.isErr)
      ?.value,
  }) as const;

/** This account's claim on an issue; unread comments claim nothing. */
const claimOf = (issue: IssueFacts): ClaimComment<IssueClaim> | undefined =>
  Result.isErr(issue.comments)
    ? undefined
    : findRecord(issue.comments.value, parseIssueClaimComment)?.says;

const decideIssues = (
  snapshot: Snapshot,
  pulls: readonly PullRequestFacts[],
  closes: ReadonlyMap<number, readonly number[]>,
  nowEpochMs: number,
): Read<readonly IssueDecision[]> => {
  if (Result.isErr(snapshot.openIssues)) {
    return snapshot.openIssues;
  }

  const { issues } = snapshot.openIssues.value;

  const listed = new Set(issues.map(({ number }) => number));

  const open = new Set(pulls.map(({ number }) => number));

  const references = Result.isOk(snapshot.references)
    ? snapshot.references.value
    : new Map<number, ReferenceFacts>();

  const otherIssues = Result.isOk(snapshot.otherIssues)
    ? snapshot.otherIssues.value
    : new Map<number, IssueFacts>();

  const statusOf = (number: number): ReferenceStatus => {
    if (listed.has(number) || open.has(number)) {
      return 'waiting';
    }

    const issue = otherIssues.get(number);

    if (issue !== undefined) {
      return issueStatusOf(issue);
    }

    const facts = references.get(number);

    return facts === undefined ? 'unknown' : referenceStatusOf(facts);
  };

  const waits = new Map(
    issues.map((issue) => [issue.number, waitsForOf(issue)] as const),
  );

  const states = decideStartStates(
    issues.map(({ number }) => ({
      number,
      startAfter: waits.get(number) ?? [],
    })),
    statusOf,
  );

  const worked = issuesInProgress(
    Array.from(closes.values(), (numbers) => ({ closes: numbers })),
  );

  // What a named number outside the lists is read from, and what tells whether
  // an open pull request closes an issue.
  const namedUnread = [snapshot.otherIssues, snapshot.references].find(
    Result.isErr,
  )?.value;

  const closersUnread = pulls
    .map(({ closingIssues }) => closingIssues)
    .find(Result.isErr)?.value;

  return Result.ok(
    issues.map((issue) => {
      const waitsOn = waits.get(issue.number) ?? [];

      const held = heldIssueClaim(claimOf(issue), nowEpochMs);

      const named = waitsOn.map((number) => ({
        number,
        status: statusOf(number),
      }));

      return {
        facts: issue,
        waitsFor: waitsOn,
        start: withProgress(
          states.get(issue.number) ?? 'free',
          progressOf({
            labels: labelNames(issue.labels),
            closedByOpenPull: worked.has(issue.number),
            held,
          }),
        ),
        named,
        claim: held,
        unread: Result.isErr(issue.blockedBy)
          ? issue.blockedBy.value
          : Result.isErr(issue.comments)
            ? issue.comments.value
            : namedUnread !== undefined &&
                named.some(({ status }) => status === 'unknown')
              ? namedUnread
              : closersUnread !== undefined && !worked.has(issue.number)
                ? closersUnread
                : undefined,
      };
    }),
  );
};
