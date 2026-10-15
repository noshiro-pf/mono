import type { QueueOwner } from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import { firstInReleaseOrder, releasedExcept, yieldsTo } from './release.mjs';
import type { PullRequest } from './types.mjs';

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

  test('puts priority:high first and priority:low last, the version pull request included', () => {
    const released = [
      pullRequest({ number: 1, labels: [queued, low] }),
      pullRequest({ number: 2 }),
      pullRequest({
        number: 3,
        headRefName: 'changeset-release/main',
        labels: [queued, high],
      }),
    ] as const;

    assert.strictEqual(firstInReleaseOrder(released, 'main')?.number, 3);

    assert.strictEqual(
      firstInReleaseOrder(Arr.take(released, 2), 'main')?.number,
      2,
    );
  });

  test('is undefined for nothing', () => {
    assert.isUndefined(firstInReleaseOrder([], 'main'));
  });
});

describe(yieldsTo, () => {
  const target = pullRequest({ number: 7, labels: [queued] });

  const worker: QueueOwner = {
    owner: 'worker',
    reason: 'in the queue',
  } as const;

  const skill: QueueOwner = {
    owner: 'skill',
    reason: 'set aside `checks-failed` at its head',
  } as const;

  test('yields to a worker’s pull request released in the same moment that goes first', () => {
    const other = pullRequest({ number: 3, labels: [queued] });

    assert.strictEqual(
      yieldsTo(target, [target, other], new Map([[3, worker]]), 'main')?.number,
      3,
    );
  });

  test('keeps its release against one that goes after it', () => {
    const other = pullRequest({ number: 12, labels: [queued] });

    assert.isUndefined(
      yieldsTo(target, [target, other], new Map([[12, worker]]), 'main'),
    );
  });

  test('does not count one set aside with its label off, which runs nothing', () => {
    // A pull request whose checks failed stays released; it is the skill's
    // until its fix is pushed, and holding the queue for it would stall it.
    const other = pullRequest({ number: 3, labels: [queued] });

    assert.isUndefined(
      yieldsTo(target, [target, other], new Map([[3, skill]]), 'main'),
    );

    assert.isUndefined(yieldsTo(target, [target, other], new Map(), 'main'));
  });

  test('does not count one paused by skip-ci', () => {
    const other = pullRequest({ number: 3, labels: [queued, skipCi] });

    assert.isUndefined(
      yieldsTo(target, [target, other], new Map([[3, worker]]), 'main'),
    );
  });
});

const queued = { name: 'merge-queued' } as const;

const skipCi = { name: 'skip-ci' } as const;

const high = { name: 'priority:high' } as const;

const low = { name: 'priority:low' } as const;

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
    mergeStateStatus: 'BLOCKED',
    autoMergeRequest: {},
    labels: [],
    ...fields,
  }) as const;
