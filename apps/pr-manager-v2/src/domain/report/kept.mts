import type {
  IssueFacts,
  OpenIssues,
  PullRequestFacts,
  Read,
  ReadError,
  Snapshot,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';

/**
 * `next`, each part that failed in it replaced by what `previous` had for it
 * (spec §4.1): a part that fails keeps the last answer read, so that a failed
 * part of one read does not empty what the read before drew. A part never read
 * stays failed, and is drawn as unread.
 *
 * What belongs to one head commit (its checks, its files) is kept only while
 * the head is the same, its comparison only while the base is too; the rest of a pull request's parts, and
 * an issue's, while the number is.
 */
export const keptSnapshot = (
  previous: Snapshot | undefined,
  next: Snapshot,
): Snapshot => {
  if (previous === undefined) {
    return next;
  }

  const pullRequests = keptPart(
    previous.pullRequests,
    next.pullRequests,
    (before, now) => keptPullRequests(before, now),
  );

  const openIssues = keptPart(
    previous.openIssues,
    next.openIssues,
    (before, now): OpenIssues => ({
      ...now,
      issues: keptIssues(before.issues, now.issues),
    }),
  );

  return {
    ...next,
    repository: {
      ...next.repository,
      viewer: keptPart(previous.repository.viewer, next.repository.viewer),
      codeOwners: keptPart(
        previous.repository.codeOwners,
        next.repository.codeOwners,
      ),
      hasQueueLabel: keptPart(
        previous.repository.hasQueueLabel,
        next.repository.hasQueueLabel,
      ),
    },
    requirements: keptPart(previous.requirements, next.requirements),
    defaultBranchChecks: keptPart(
      previous.defaultBranchChecks,
      next.defaultBranchChecks,
    ),
    pullRequests,
    openIssues,
    otherIssues: keptPart(previous.otherIssues, next.otherIssues),
    references: keptPart(previous.references, next.references),
    merged: keptPart(previous.merged, next.merged),
    queueLayers: keptPart(previous.queueLayers, next.queueLayers),
  };
};

/**
 * Every part that failed in `snapshot`, the parts of each pull request and
 * issue included, for saying so where they are drawn. `skipped` parts are left
 * out: the reader does not offer them, which is no failure.
 */
export const failuresOf = (snapshot: Snapshot): SnapshotFailures => {
  const pullRequests = Result.isOk(snapshot.pullRequests)
    ? snapshot.pullRequests.value.flatMap(pullRequestFailures)
    : ([] as const);

  const issues = Result.isOk(snapshot.openIssues)
    ? snapshot.openIssues.value.issues.flatMap(issueFailures)
    : ([] as const);

  return {
    report: errorsOf([
      snapshot.repository.viewer,
      snapshot.repository.codeOwners,
      snapshot.repository.hasQueueLabel,
      snapshot.requirements,
      snapshot.pullRequests,
      snapshot.references,
      snapshot.defaultBranchChecks,
      snapshot.queueLayers,
      ...pullRequests,
    ]),
    issues: errorsOf([snapshot.openIssues, snapshot.otherIssues, ...issues]),
    merged: errorsOf([snapshot.merged]),
  };
};

/** The failures of one read, by the blocks that draw them. */
export type SnapshotFailures = Readonly<{
  /** The merge order and the queue. */
  report: readonly ReadError[];
  issues: readonly ReadError[];
  merged: readonly ReadError[];
}>;

const keptPart = <A,>(
  previous: Read<A>,
  next: Read<A>,
  merge: (before: A, now: A) => A = (_, now) => now,
): Read<A> =>
  Result.isOk(next)
    ? Result.isOk(previous)
      ? Result.ok(merge(previous.value, next.value))
      : next
    : Result.isOk(previous)
      ? previous
      : next;

const keptPullRequests = (
  previous: readonly PullRequestFacts[],
  next: readonly PullRequestFacts[],
): readonly PullRequestFacts[] => {
  const before = new Map(previous.map((pr) => [pr.number, pr]));

  return next.map((pr) => {
    const was = before.get(pr.number);

    if (was === undefined) {
      return pr;
    }

    const sameHead = was.headSha === pr.headSha;

    const ofHead = <A,>(old: Read<A>, now: Read<A>): Read<A> =>
      sameHead ? keptPart(old, now) : now;

    // Ahead and behind are against the base: once a pull request's base
    // changes, its old comparison says nothing of the new one.
    const ofHeadAndBase = <A,>(old: Read<A>, now: Read<A>): Read<A> =>
      was.baseRef === pr.baseRef ? ofHead(old, now) : now;

    return {
      ...pr,
      headCommittedAt: ofHead(was.headCommittedAt, pr.headCommittedAt),
      checks: ofHead(was.checks, pr.checks),
      review: ofHead(was.review, pr.review),
      comparison: ofHeadAndBase(was.comparison, pr.comparison),
      comments: keptPart(was.comments, pr.comments),
      closingIssues: keptPart(was.closingIssues, pr.closingIssues),
      nativeStack: keptPart(was.nativeStack, pr.nativeStack),
      baseChanges: keptPart(was.baseChanges, pr.baseChanges),
      mergedParent: keptPart(was.mergedParent, pr.mergedParent),
    };
  });
};

const keptIssues = (
  previous: readonly IssueFacts[],
  next: readonly IssueFacts[],
): readonly IssueFacts[] => {
  const before = new Map(previous.map((issue) => [issue.number, issue]));

  return next.map((issue) => {
    const was = before.get(issue.number);

    return was === undefined
      ? issue
      : {
          ...issue,
          blockedBy: keptPart(was.blockedBy, issue.blockedBy),
          comments: keptPart(was.comments, issue.comments),
        };
  });
};

const pullRequestFailures = (pr: PullRequestFacts): readonly Read<unknown>[] =>
  [
    pr.headCommittedAt,
    pr.checks,
    pr.review,
    pr.comments,
    pr.closingIssues,
    pr.comparison,
    pr.nativeStack,
    pr.baseChanges,
    pr.mergedParent,
  ] as const;

const issueFailures = (issue: IssueFacts): readonly Read<unknown>[] =>
  [issue.blockedBy, issue.comments] as const;

const errorsOf = (reads: readonly Read<unknown>[]): readonly ReadError[] =>
  Arr.generate(function* () {
    for (const read of reads) {
      if (Result.isErr(read) && read.value.kind !== 'skipped') {
        yield read.value;
      }
    }
  });
