import {
  afterWatch,
  followHead,
  isDemoted,
  pruneDemotions,
} from './demotions.mjs';
import { type Demotions, type PullRequest } from './types.mjs';

describe(afterWatch, () => {
  const none: Demotions = new Map();

  test('demotes a pull request that sat green without merging', () => {
    assert.deepStrictEqual(
      afterWatch(none, 7, 'head', 'not-merging'),
      new Map([[7, 'head']]),
    );
  });

  test('demotes nothing for any other ending', () => {
    for (const outcome of [
      'merged',
      'checks-failed',
      'timeout',
      'behind-again',
    ] as const) {
      assert.deepStrictEqual(afterWatch(none, 7, 'head', outcome), none);
    }
  });

  // The watch may end on a head this run pushed — a fixer's diff amended
  // onto the branch — and a demotion that stayed on the old head would be
  // cleared by the next survey as if someone else had pushed.
  test('keeps a demotion on the head the watch ended on', () => {
    assert.deepStrictEqual(
      afterWatch(new Map([[7, 'old']]), 7, 'new', 'checks-failed'),
      new Map([[7, 'new']]),
    );
  });
});

describe(followHead, () => {
  test('moves a demotion to the head this run pushed', () => {
    assert.deepStrictEqual(
      followHead(new Map([[7, 'before-rebase']]), 7, 'after-rebase'),
      new Map([[7, 'after-rebase']]),
    );
  });

  test('demotes nothing that was not demoted', () => {
    assert.deepStrictEqual(
      followHead(new Map([[7, 'head']]), 8, 'other'),
      new Map([[7, 'head']]),
    );
  });
});

describe(pruneDemotions, () => {
  const demoted: Demotions = new Map([
    [1, 'a'.repeat(40)],
    [2, 'a'.repeat(40)],
    [3, 'a'.repeat(40)],
  ]);

  // The base moving is not among what clears it: that is exactly when a
  // pull request that sat green is rebased again, and the point of the
  // demotion is that it waits behind the rest when that happens.
  test('keeps a demotion for as long as nobody else pushes', () => {
    const kept = pruneDemotions(demoted, [
      pullRequest({ number: 1 }),
      pullRequest({ number: 2, headRefOid: 'd'.repeat(40) }),
    ]);

    assert.deepStrictEqual(kept, new Map([[1, 'a'.repeat(40)]]));

    assert.isTrue(isDemoted(kept, pullRequest({ number: 1 })));

    assert.isFalse(
      isDemoted(kept, pullRequest({ number: 1, headRefOid: 'd'.repeat(40) })),
    );
  });
});

const pullRequest = (
  fields: Partial<PullRequest> & Readonly<{ number: number }>,
): PullRequest =>
  ({
    title: `pull request #${fields.number}`,
    body: '',
    state: 'OPEN',
    headRefName: `feature/${fields.number}`,
    headRefOid: 'a'.repeat(40),
    baseRefName: 'main',
    isDraft: false,
    mergeStateStatus: 'BEHIND',
    autoMergeRequest: {},
    labels: [],
    ...fields,
  }) as const;
