import { Result } from 'ts-data-forge';
import { writeSetAsideComment } from '../conventions/index.mjs';
import type {
  HeadChecks,
  IssueFacts,
  PullRequestFacts,
  ReferenceFacts,
  Snapshot,
} from '../snapshot/index.mjs';
import { decideQueue, type QueueDecision } from './queue.mjs';

const TIP = 'e'.repeat(40);

const NOW = Date.parse('2026-11-10T00:00:00Z');

const label = (name: string) =>
  ({ name, color: '000000', description: '' }) as const;

const noChecks = (sha: string): HeadChecks =>
  ({
    sha,
    runs: [],
    statuses: [],
    rounds: [],
  }) as const;

const pull = (
  number: number,
  fields: Partial<PullRequestFacts> = {},
): PullRequestFacts => {
  const headSha = number.toString(16).padStart(40, '0');

  return {
    number,
    title: `#${number}`,
    body: '',
    author: 'someone',
    url: '',
    isDraft: false,
    labels: [label('merge-queued'), label('skip-ci')],
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

const issue = (number: number, fields: Partial<IssueFacts> = {}): IssueFacts =>
  ({
    number,
    state: 'open',
    stateReason: undefined,
    title: `#${number}`,
    body: '',
    author: 'someone',
    url: '',
    labels: [],
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    commentCount: 0,
    blockedBy: Result.ok([]),
    comments: Result.ok([]),
    ...fields,
  }) as const;

const snapshot = (
  pulls: readonly PullRequestFacts[],
  issues: readonly IssueFacts[] = [],
): Snapshot =>
  ({
    readAt: '2026-11-10T00:00:00Z',
    authenticated: true,
    repository: {
      repo: { owner: 'noshiro-pf', name: 'mono' },
      defaultBranch: 'main',
      defaultBranchTip: TIP,
      viewer: Result.ok('noshiro-pf'),
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
    queueLayers: Result.ok([]),
    branchTips: Result.ok(new Map<string, string>()),
    followed: Result.ok([]),
  }) as const;

const decide = (
  from: Snapshot,
  demoted: readonly number[] = [],
): QueueDecision =>
  Result.unwrapThrow(
    decideQueue(from, { nowEpochMs: NOW, demoted: new Set<number>(demoted) }),
  );

describe(decideQueue, () => {
  test('is unread when the open pull requests are', () => {
    const unread = decideQueue(
      {
        ...snapshot([]),
        pullRequests: Result.err({
          kind: 'unavailable',
          what: 'the open pull requests',
          message: '502',
        }),
      },
      { nowEpochMs: NOW, demoted: new Set<number>() },
    );

    assert.isTrue(Result.isErr(unread));
  });

  test('orders the candidates, honouring Merge-After, priority and demotion', () => {
    const decided = decide(
      snapshot([
        pull(1),
        pull(2, { body: 'Merge-After: #1' }),
        pull(3, {
          labels: [
            label('merge-queued'),
            label('skip-ci'),
            label('priority:high'),
          ],
        }),
        pull(4),
      ]),
      [1],
    );

    assert.deepStrictEqual(decided.candidates, [3, 4, 1]);

    assert.deepStrictEqual(
      decided.pullRequests.find(({ facts }) => facts.number === 2)?.standing,
      { kind: 'waiting', on: [1], cyclic: false },
    );
  });

  test('leaves a pull request set aside at its head to its owner', () => {
    const pr = pull(5);

    const decided = decide(
      snapshot([
        {
          ...pr,
          comments: Result.ok([
            {
              id: 1,
              body: writeSetAsideComment(
                { reason: 'checks-failed', headSha: pr.headSha, baseSha: TIP },
                'prose',
              ),
              createdAt: '2026-11-02T00:00:00Z',
            },
          ]),
        },
      ]),
    );

    assert.strictEqual(decided.pullRequests[0]?.standing.kind, 'owned');

    assert.deepStrictEqual(decided.candidates, []);
  });

  test('makes a queued pull request whose comments were not read unread, not a candidate', () => {
    const decided = decide(
      snapshot([
        pull(6, {
          comments: Result.err({
            kind: 'rate-limited',
            what: 'the comments of #6',
            message: 'secondary limit',
          }),
        }),
      ]),
    );

    assert.strictEqual(decided.pullRequests[0]?.standing.kind, 'unread');

    assert.deepStrictEqual(decided.candidates, []);
  });

  test('judges the checks of a blocked pull request without skip-ci', () => {
    const pr = pull(7, { labels: [label('merge-queued')] });

    const decided = decide(
      snapshot([
        {
          ...pr,
          checks: Result.ok({
            ...noChecks(pr.headSha),
            runs: [
              {
                name: 'code-check-result / result',
                status: 'completed',
                conclusion: 'failure',
                checkSuiteId: 1,
                id: 1,
                startedAt: undefined,
                completedAt: '2026-11-09T00:00:00Z',
                annotationTitles: undefined,
                url: '',
              },
            ],
          }),
        },
      ]),
    );

    assert.deepStrictEqual(decided.pullRequests[0]?.standing, {
      kind: 'failing',
    });
  });

  test('shows a startable issue an open pull request closes as in progress', () => {
    const decided = decide(
      snapshot(
        [
          pull(8, {
            closingIssues: Result.ok([
              { number: 20, title: '', url: '', state: 'open' },
            ]),
          }),
        ],
        [issue(20), issue(21, { body: 'Start-After: #20' })],
      ),
    );

    assert.deepStrictEqual(
      Result.unwrapThrow(decided.issues).map(({ facts, start }) => [
        facts.number,
        start,
      ]),
      [
        [20, 'in-progress'],
        [21, 'blocked'],
      ],
    );
  });

  test('carries the claim an issue’s start state was read from', () => {
    const decided = decide(
      snapshot(
        [],
        [
          issue(30, {
            comments: Result.ok([
              {
                id: 1,
                body: '<!-- start-issue:claim state=planned by=s at=2026-11-09T23:00:00Z -->',
                createdAt: '2026-11-09T23:00:00Z',
              },
            ]),
          }),
        ],
      ),
    );

    assert.deepStrictEqual(
      Result.unwrapThrow(decided.issues).map(({ start, claim }) => ({
        start,
        claim,
      })),
      [
        {
          start: 'planned',
          claim: { state: 'planned', by: 's', at: '2026-11-09T23:00:00Z' },
        },
      ],
    );
  });

  test('carries no claim once a planned one has lapsed', () => {
    const decided = decide(
      snapshot(
        [],
        [
          issue(30, {
            comments: Result.ok([
              {
                id: 1,
                body: '<!-- start-issue:claim state=planned by=s at=2026-11-07T23:00:00Z -->',
                createdAt: '2026-11-07T23:00:00Z',
              },
            ]),
          }),
        ],
      ),
    );

    assert.deepStrictEqual(
      Result.unwrapThrow(decided.issues).map(({ start, claim }) => ({
        start,
        claim,
      })),
      [{ start: 'free', claim: undefined }],
    );
  });

  // Picked without what an issue it closes waits for, it could merge first.
  test('leaves a candidate unread when its inherited order is', () => {
    const failed = {
      kind: 'unavailable',
      what: 'the closing issues of #9',
      message: '502',
    } as const;

    const decided = decide(
      snapshot(
        [
          pull(9, { closingIssues: Result.err(failed) }),
          pull(10, {
            closingIssues: Result.ok([
              { number: 30, title: '', url: '', state: 'open' },
            ]),
          }),
        ],
        [issue(30, { blockedBy: Result.err(failed) })],
      ),
    );

    assert.deepStrictEqual(
      decided.pullRequests.map(({ standing }) => standing),
      [
        { kind: 'unread', error: failed },
        { kind: 'unread', error: failed },
      ],
    );

    assert.deepStrictEqual(decided.candidates, []);

    assert.deepStrictEqual(
      Result.unwrapThrow(decided.issues).map(({ unread }) => unread),
      [failed],
    );
  });

  // A dependency named by an issue outside the list is judged by its own state.
  test('judges a named issue outside the list by its state', () => {
    const decided = decide({
      ...snapshot([], [issue(40, { body: 'Start-After: #41' })]),
      otherIssues: Result.ok(
        new Map<number, IssueFacts>([
          [41, issue(41, { state: 'closed', stateReason: 'not_planned' })],
        ]),
      ),
    });

    assert.deepStrictEqual(
      Result.unwrapThrow(decided.issues).map(({ start, named }) => [
        start,
        named,
      ]),
      [['attention', [{ number: 41, status: 'abandoned' }]]],
    );
  });

  test('reads an unread inheritance through the pull requests closing what it waits for', () => {
    const failed = {
      kind: 'unavailable',
      what: 'the closing issues of #11',
      message: '502',
    } as const;

    const decided = decide(
      snapshot(
        [
          pull(10, {
            closingIssues: Result.ok([
              { number: 1, title: '', url: '', state: 'open' },
            ]),
          }),
          pull(11, { closingIssues: Result.err(failed) }),
        ],
        [issue(1, { body: 'Start-After: #2' }), issue(2)],
      ),
    );

    assert.deepStrictEqual(
      decided.pullRequests.map(({ standing }) => standing),
      [
        { kind: 'unread', error: failed },
        { kind: 'unread', error: failed },
      ],
    );
  });

  test('keeps the version pull request a candidate, which inherits nothing', () => {
    const failed = {
      kind: 'unavailable',
      what: 'the closing issues',
      message: '502',
    } as const;

    const decided = decide(
      snapshot([
        pull(12, {
          headRef: 'changeset-release/main',
          closingIssues: Result.err(failed),
        }),
      ]),
    );

    assert.deepStrictEqual(decided.pullRequests[0]?.standing, {
      kind: 'candidate',
    });
  });

  test('keeps a released pull request in flight when its review is unread', () => {
    const failed = {
      kind: 'rate-limited',
      what: 'the review of #13',
      message: '403',
    } as const;

    const pr = pull(13, {
      labels: [label('merge-queued')],
      mergeState: 'BLOCKED',
      review: Result.err(failed),
    });

    const decided = decide(
      snapshot([{ ...pr, checks: Result.ok(noChecks(pr.headSha)) }]),
    );

    assert.deepStrictEqual(decided.pullRequests[0]?.standing, {
      kind: 'in-flight',
    });
  });

  test('says an issue whose comments are unread may miss a claim', () => {
    const failed = {
      kind: 'unavailable',
      what: 'the comments of #50',
      message: '502',
    } as const;

    const decided = decide(
      snapshot([], [issue(50, { comments: Result.err(failed) })]),
    );

    assert.deepStrictEqual(
      Result.unwrapThrow(decided.issues).map(({ unread }) => unread),
      [failed],
    );
  });

  test('says an issue may be wrong when what it reads of others is unread', () => {
    const failed = {
      kind: 'unavailable',
      what: 'the references',
      message: '502',
    } as const;

    const decided = decide({
      ...snapshot(
        [pull(60, { closingIssues: Result.err(failed) })],
        [issue(61, { body: 'Start-After: #3' }), issue(62)],
      ),
      references: Result.err(failed),
    });

    assert.deepStrictEqual(
      Result.unwrapThrow(decided.issues).map(({ facts, unread }) => [
        facts.number,
        unread,
      ]),
      [
        [61, failed],
        [62, failed],
      ],
    );
  });
});
