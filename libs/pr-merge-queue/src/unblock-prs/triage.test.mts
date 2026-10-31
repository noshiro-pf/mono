import { describeAction, orderCandidates, priorityPhrase } from './triage.mjs';
import type { PullRequest } from './types.mjs';

describe(orderCandidates, () => {
  // The ranks themselves are `pr-report-core`'s; what this run demoted is
  // what only the worker knows.

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
