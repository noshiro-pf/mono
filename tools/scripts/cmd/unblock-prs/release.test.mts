import { firstInReleaseOrder, releasedExcept } from './release.mjs';
import { type PullRequest } from './types.mjs';

describe(releasedExcept, () => {
  test('is every other open queued pull request without skip-ci', () => {
    const released = pullRequest({ number: 1, labels: [queued] });

    const kept = pullRequest({ number: 2, labels: [queued] });

    assert.deepStrictEqual(
      releasedExcept(
        [
          released,
          kept,
          pullRequest({ number: 3, labels: [queued, skipCi] }),
          pullRequest({ number: 4, labels: [] }),
          pullRequest({ number: 5, labels: [queued], state: 'MERGED' }),
        ],
        kept.number,
      ),
      [released],
    );
  });

  test('counts a draft, a pull request without auto-merge and one on another base', () => {
    // Each of them runs a matrix when pushed to, which is what the rule is
    // about; whether it could merge afterwards is a different question.
    const others = [
      pullRequest({ number: 1, labels: [queued], isDraft: true }),
      pullRequest({ number: 2, labels: [queued], autoMergeRequest: null }),
      pullRequest({ number: 3, labels: [queued], baseRefName: 'feature' }),
    ] as const;

    assert.deepStrictEqual(releasedExcept(others, 9), others);
  });
});

describe(firstInReleaseOrder, () => {
  test('is the lowest number', () => {
    assert.strictEqual(
      firstInReleaseOrder(
        [pullRequest({ number: 12 }), pullRequest({ number: 7 })],
        'main',
      )?.number,
      7,
    );
  });

  test('puts the version pull request last', () => {
    assert.strictEqual(
      firstInReleaseOrder(
        [
          pullRequest({ number: 3, headRefName: 'changeset-release/main' }),
          pullRequest({ number: 12 }),
        ],
        'main',
      )?.number,
      12,
    );
  });

  test('is undefined for nothing', () => {
    assert.isUndefined(firstInReleaseOrder([], 'main'));
  });
});

const queued = { name: 'merge-queued' } as const;

const skipCi = { name: 'skip-ci' } as const;

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
    mergeStateStatus: 'BLOCKED',
    autoMergeRequest: {},
    labels: [],
    ...fields,
  }) as const;
