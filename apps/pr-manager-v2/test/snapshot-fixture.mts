import type {
  HeadChecks,
  IssueFacts,
  Label,
  MovedHead,
  PullRequestFacts,
  ReferenceFacts,
  Snapshot,
} from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';

/** Test fixtures: a snapshot and its members, every part read. */

export const TIP = 'f'.repeat(40);

export const label = (name: string): Label =>
  ({
    name,
    color: 'ededed',
    description: '',
  }) as const;

export const noChecks = (sha: string): HeadChecks =>
  ({
    sha,
    runs: [],
    statuses: [],
    rounds: [],
  }) as const;

export const pull = (
  number: number,
  fields: Partial<PullRequestFacts> = {},
): PullRequestFacts => {
  const headSha = number.toString(16).padStart(40, '0');

  return {
    number,
    title: `#${number}`,
    body: '',
    author: 'someone',
    url: `https://github.com/o/r/pull/${number}`,
    isDraft: false,
    labels: [],
    autoMerge: false,
    headRef: `feature/${number}`,
    headSha,
    baseRef: 'main',
    fromFork: false,
    mergeState: 'BLOCKED',
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    headCommittedAt: Result.ok('2026-11-01T00:00:00Z'),
    checks: Result.ok(noChecks(headSha)),
    review: Result.ok({
      latestReviews: [],
      files: [],
      filesComplete: true,
      unresolvedConversations: 0,
      pushers: 'unknown',
    }),
    comments: Result.ok([]),
    closingIssues: Result.ok([]),
    comparison: Result.ok({ aheadBy: 1, behindBy: 0 }),
    nativeStack: Result.ok(undefined),
    baseChanges: Result.ok([]),
    mergedParent: Result.ok(undefined),
    ...fields,
  };
};

export const issue = (
  number: number,
  fields: Partial<IssueFacts> = {},
): IssueFacts =>
  ({
    number,
    state: 'open',
    stateReason: undefined,
    title: `#${number}`,
    body: '',
    author: 'someone',
    url: `https://github.com/o/r/issues/${number}`,
    labels: [],
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    commentCount: 0,
    blockedBy: Result.ok([]),
    comments: Result.ok([]),
    ...fields,
  }) as const;

export const snapshot = (
  pulls: readonly PullRequestFacts[],
  issues: readonly IssueFacts[] = [],
  fields: Partial<Snapshot> = {},
): Snapshot =>
  ({
    readAt: '2026-11-10T00:00:00Z',
    authenticated: true,
    repository: {
      repo: { owner: 'o', name: 'r' },
      defaultBranch: 'main',
      defaultBranchTip: TIP,
      viewer: Result.ok('me'),
      codeOwners: Result.ok(undefined),
      hasQueueLabel: Result.ok(true),
    },
    requirements: Result.ok({
      requiredContexts: ['code-check-result / result'],
      requireCodeOwnerReview: false,
      requireConversationResolution: false,
    }),
    defaultBranchChecks: Result.ok(noChecks(TIP)),
    pullRequests: Result.ok(pulls),
    openIssues: Result.ok({ issues, complete: true }),
    otherIssues: Result.ok(new Map<number, IssueFacts>()),
    references: Result.ok(new Map<number, ReferenceFacts>()),
    merged: Result.ok([]),
    queueLayers: Result.ok({
      baseTree: 'b',
      layers: [],
      movedHeads: new Map<number, MovedHead>(),
    }),
    branchTips: Result.ok(new Map<string, string>()),
    followed: Result.ok([]),
    ...fields,
  }) as const;

export const failed = (what: string): Result<never, ReadErrorShape> =>
  Result.err({ kind: 'unavailable', what, message: '502' });

type ReadErrorShape = Readonly<{
  kind: 'unavailable';
  what: string;
  message: string;
}>;
