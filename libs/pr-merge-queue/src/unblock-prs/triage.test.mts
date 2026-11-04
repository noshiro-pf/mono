import { parseCodeOwners, reviewHold, type ReviewState } from 'pr-report-core';
import {
  awaitsMergeState,
  bypassOfRead,
  describeAction,
  orderCandidates,
  outOfSyncAtSurvey,
  priorityPhrase,
} from './triage.mjs';
import type { OutOfSync, OutOfSyncSighting, PullRequest } from './types.mjs';

describe(orderCandidates, () => {
  // The ranks themselves are `pr-report-core`'s; what this run demoted is what
  // only the worker knows.

  // Last of all, the release included: the release is known to be able to
  // merge, and this one is known to have sat green without merging.
  test('puts a pull request that sat green without merging last', () => {
    assert.deepStrictEqual(
      numbers(
        orderCandidates(
          [
            pullRequest({ number: 1 }),
            pullRequest({
              number: 2,
              headRefName: 'changeset-release/main',
            }),
            pullRequest({ number: 3, mergeStateStatus: 'DIRTY' }),
            pullRequest({ number: 4 }),
          ],
          {
            defaultBranch: 'main',
            demoted: new Map<number, string>([[1, 'a'.repeat(40)]]),
            bypass: new Map<number, string>(),
          },
        ),
      ),
      [4, 3, 2, 1],
    );
  });

  test('forgets the demotion once someone else has pushed', () => {
    assert.deepStrictEqual(
      numbers(
        orderCandidates(
          [
            pullRequest({ number: 1, headRefOid: 'c'.repeat(40) }),
            pullRequest({ number: 2 }),
          ],
          {
            defaultBranch: 'main',
            demoted: new Map<number, string>([[1, 'a'.repeat(40)]]),
            bypass: new Map<number, string>(),
          },
        ),
      ),
      [1, 2],
    );
  });

  test('puts one only a bypass merges behind the rest', () => {
    assert.deepStrictEqual(
      numbers(
        orderCandidates(
          [
            pullRequest({ number: 1 }),
            pullRequest({ number: 2, mergeStateStatus: 'DIRTY' }),
          ],
          {
            defaultBranch: 'main',
            demoted: new Map<number, string>(),
            bypass: new Map<number, string>([[1, '@someone owns it']]),
          },
        ),
      ),
      [2, 1],
    );
  });
});

describe(priorityPhrase, () => {
  const labelSets = [
    [],
    [{ name: 'priority:low' }],
    [{ name: 'priority:high' }],
    [{ name: 'priority:high' }, { name: 'priority:low' }],
  ] as const;

  test('says what the priority label did', () => {
    assert.deepStrictEqual(
      labelSets.map((labels) =>
        priorityPhrase(pullRequest({ number: 1, labels }), false),
      ),
      [
        '',
        ' — behind the rest, by priority:low',
        ' — ahead of the rest, by priority:high',
        ' — labelled both priority:high and priority:low, so neither counts',
      ],
    );
  });

  test('says one only a bypass merges goes behind the rest, unless priority:high', () => {
    assert.deepStrictEqual(
      labelSets.map((labels) =>
        priorityPhrase(pullRequest({ number: 1, labels }), true),
      ),
      [
        ' — behind the rest, as only a bypass merges it',
        ' — behind the rest, by priority:low, and as only a bypass merges it',
        ' — ahead of the rest, by priority:high',
        ' — labelled both priority:high and priority:low, so neither counts — behind the rest, as only a bypass merges it',
      ],
    );
  });
});

describe(describeAction, () => {
  test('arms what it picks', () => {
    assert.strictEqual(
      describeAction(pullRequest({ number: 1 }), 'main', {
        stackParents: new Map<number, number>(),
        toArm: new Set<number>([1]),
        bypass: new Map<number, string>(),
      }),
      'rebase onto main, arm auto-merge',
    );
  });

  test('leaves auto-merge off one that needs a bypass merge, and still runs its checks', () => {
    assert.strictEqual(
      describeAction(
        pullRequest({
          number: 1,
          labels: [queued, { name: 'skip-ci' }],
          autoMergeRequest: null,
        }),
        'main',
        {
          stackParents: new Map<number, number>(),
          toArm: new Set<number>(),
          bypass: new Map<number, string>([
            [1, 'the author is the only owner'],
          ]),
        },
      ),
      'rebase onto main, leave auto-merge off (the author is the only owner, so it needs a bypass merge), then take skip-ci off it',
    );
  });
});

describe(awaitsMergeState, () => {
  const unknown = pullRequest({ number: 7, mergeStateStatus: 'UNKNOWN' });

  const elsewhere = 'e'.repeat(40);

  const none: OutOfSync = new Map<number, OutOfSyncSighting>();

  const sighted = (branchSha: string): OutOfSync =>
    new Map<number, OutOfSyncSighting>([
      [7, { headSha: unknown.headRefOid, branchSha, sinceEpochMs: 0 }],
    ]);

  test('waits for an armed pull request GitHub is still computing', () => {
    assert.isTrue(awaitsMergeState(unknown, unknown.headRefOid, none));
  });

  // No listing of the branches says nothing against the merge state: wait, as
  // before anything compared them.
  test('waits for one whose branch was not read', () => {
    assert.isTrue(awaitsMergeState(unknown, undefined, sighted(elsewhere)));
  });

  test('does not wait for one with nothing armed', () => {
    assert.isFalse(
      awaitsMergeState(
        { ...unknown, autoMergeRequest: null },
        unknown.headRefOid,
        none,
      ),
    );
  });

  // A push GitHub has yet to take in looks like this for a few seconds, and
  // that wait is what keeps a released pull request read as in flight.
  test('waits for one whose branch is elsewhere when no survey has seen it', () => {
    assert.isTrue(awaitsMergeState(unknown, elsewhere, none));
  });

  // GitHub never took in its branch's last push, so its state stays unknown for
  // as long as that lasts, and every survey would re-list for nothing — whether
  // or not this run has set it aside yet, and whatever its place in the queue.
  test('does not wait for one an earlier survey found at the same place', () => {
    assert.isFalse(awaitsMergeState(unknown, elsewhere, sighted(elsewhere)));
  });

  test('waits again once its branch has moved since', () => {
    assert.isTrue(
      awaitsMergeState(unknown, 'f'.repeat(40), sighted(elsewhere)),
    );
  });
});

describe(outOfSyncAtSurvey, () => {
  const head = 'a'.repeat(40);

  const elsewhere = 'e'.repeat(40);

  const branches = new Map<string, string>([
    ['feature/1', elsewhere],
    ['feature/2', head],
    ['feature/3', elsewhere],
    ['feature/4', elsewhere],
    ['feature/5', elsewhere],
  ]);

  test('names the armed UNKNOWN pull requests whose branch is elsewhere', () => {
    assert.deepStrictEqual(
      outOfSyncAtSurvey(
        [
          unknownPullRequest({ number: 1 }),
          // At the head GitHub shows: still computing.
          unknownPullRequest({ number: 2 }),
          // Nothing armed: no survey waits on it.
          unknownPullRequest({ number: 3, autoMergeRequest: null }),
          // A state GitHub has computed.
          pullRequest({ number: 4 }),
          // A fork's branch is not on origin, so a same-named one says nothing.
          unknownPullRequest({ number: 5, isCrossRepository: true }),
          // No branch of that name: nothing to compare.
          unknownPullRequest({ number: 6 }),
        ],
        branches,
      ).map(({ pr, branchAt }) => [pr.number, branchAt]),
      [[1, elsewhere]],
    );
  });
});

describe(bypassOfRead, () => {
  const rebased = 'b'.repeat(40);

  // A stacked pull request whose lower layer changed a path only its author
  // owns still carries that layer's commit until it is rebased onto the squash
  // merge, so triage reads the path among its files.
  const beforeRebase = state([
    '.github/workflows/synstate-benchmark.yml',
    'apps/synstate-docs/src/index.mts',
  ]);

  const afterRebase = state(['apps/synstate-docs/src/index.mts']);

  test("premise: the lower layer's owned path needs a bypass merge", () => {
    assert.strictEqual(reviewHold(beforeRebase, rules)?.kind, 'bypass');
  });

  test('needs no bypass at a rebased head whose own files need nothing', () => {
    assert.deepStrictEqual(
      bypassOfRead(
        { head: rebased, hold: reviewHold(afterRebase, rules) },
        rebased,
      ),
      { reason: undefined },
    );
  });

  test('needs a bypass at a rebased head that brought an owned path in', () => {
    assert.deepStrictEqual(
      bypassOfRead(
        { head: rebased, hold: reviewHold(beforeRebase, rules) },
        rebased,
      ),
      {
        reason:
          '@noshiro-pf is the only owner of .github/workflows/synstate-benchmark.yml and its author, who may not approve it',
      },
    );
  });

  test('says nothing while GitHub still answers for the head before the push', () => {
    assert.isUndefined(
      bypassOfRead(
        { head: 'a'.repeat(40), hold: reviewHold(afterRebase, rules) },
        rebased,
      ),
    );
  });

  test('needs no bypass where the ruleset asks no review', () => {
    assert.deepStrictEqual(bypassOfRead(undefined, rebased), {
      reason: undefined,
    });
  });

  test('a review that holds for an approval is not a bypass', () => {
    assert.deepStrictEqual(
      bypassOfRead(
        {
          head: rebased,
          hold: { kind: 'held', reason: '1 unresolved review conversation' },
        },
        rebased,
      ),
      { reason: undefined },
    );
  });
});

const rules = {
  requireCodeOwnerReview: true,
  requireConversationResolution: true,
  codeOwners: parseCodeOwners('/.github/workflows/ @noshiro-pf\n'),
} as const;

const state = (files: readonly string[]): ReviewState =>
  ({
    author: 'noshiro-pf',
    approvers: [],
    files,
    filesComplete: true,
    unresolvedConversations: 0,
  }) as const;

const queued = { name: 'merge-queued' } as const;

const numbers = (prs: readonly PullRequest[]): readonly number[] =>
  prs.map((pr) => pr.number);

const pullRequest = (
  fields: Partial<PullRequest> & Readonly<{ number: number }>,
): PullRequest =>
  ({
    id: `PR_${fields.number}`,
    title: `pull request #${fields.number}`,
    body: '',
    state: 'OPEN',
    headRefName: `feature/${fields.number}`,
    headRefOid: 'a'.repeat(40),
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'BEHIND',
    autoMergeRequest: {},
    labels: [queued],
    ...fields,
  }) as const;

const unknownPullRequest = (
  fields: Partial<PullRequest> & Readonly<{ number: number }>,
): PullRequest => pullRequest({ mergeStateStatus: 'UNKNOWN', ...fields });
