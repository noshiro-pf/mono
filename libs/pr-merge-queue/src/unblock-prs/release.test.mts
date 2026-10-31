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
        noBypass,
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
        noBypass,
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

    assert.strictEqual(
      firstInReleaseOrder(released, 'main', noBypass)?.number,
      3,
    );

    assert.strictEqual(
      firstInReleaseOrder(Arr.take(released, 2), 'main', noBypass)?.number,
      2,
    );
  });

  // Kept released, it goes green only to be set aside for a person, while
  // the one paused for it could have merged on its own.
  test('puts one only a bypass merges with priority:low, unless labelled priority:high', () => {
    const released = [
      pullRequest({ number: 1 }),
      pullRequest({ number: 2, labels: [queued, low] }),
      pullRequest({ number: 3 }),
    ] as const;

    assert.strictEqual(
      firstInReleaseOrder(
        released,
        'main',
        new Map<number, string>([[1, '@someone owns it']]),
      )?.number,
      3,
    );

    assert.strictEqual(
      firstInReleaseOrder(
        [pullRequest({ number: 1, labels: [queued, high] }), released[2]],
        'main',
        new Map<number, string>([[1, '@someone owns it']]),
      )?.number,
      1,
    );
  });

  test('is undefined for nothing', () => {
    assert.isUndefined(firstInReleaseOrder([], 'main', noBypass));
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
      yieldsTo(
        target,
        [target, other],
        new Map<number, QueueOwner>([[3, worker]]),
        new Set<number>([3, 7]),
        'main',
        noBypass,
      )?.number,
      3,
    );
  });

  test('keeps its release against one only a bypass merges', () => {
    const other = pullRequest({ number: 3, labels: [queued] });

    assert.isUndefined(
      yieldsTo(
        target,
        [target, other],
        new Map<number, QueueOwner>([[3, worker]]),
        new Set<number>([3, 7]),
        'main',
        new Map<number, string>([[3, '@someone owns it']]),
      ),
    );
  });

  test('keeps its release against one that goes after it', () => {
    const other = pullRequest({ number: 12, labels: [queued] });

    assert.isUndefined(
      yieldsTo(
        target,
        [target, other],
        new Map<number, QueueOwner>([[12, worker]]),
        new Set<number>([7, 12]),
        'main',
        noBypass,
      ),
    );
  });

  test('keeps its release against one that was already released when the survey picked it', () => {
    // Released before the survey — a person took `skip-ci` off, or labelled
    // `merge-queued` one that never had it — and not in flight, or the survey
    // would have watched it: waiting on its declared order, held by its
    // review, conflicting. It is still released on the next survey, so
    // yielding to it would release and pause the same pull request forever.
    const other = pullRequest({ number: 3, labels: [queued, high] });

    assert.isUndefined(
      yieldsTo(
        target,
        [target, other],
        new Map<number, QueueOwner>([[3, worker]]),
        new Set<number>([7]),
        'main',
        noBypass,
      ),
    );
  });

  test('does not count one set aside with its label off, which runs nothing', () => {
    // A pull request whose checks failed stays released; it is the skill's
    // until its fix is pushed, and holding the queue for it would stall it.
    const other = pullRequest({ number: 3, labels: [queued] });

    assert.isUndefined(
      yieldsTo(
        target,
        [target, other],
        new Map<number, QueueOwner>([[3, skill]]),
        new Set<number>([3, 7]),
        'main',
        noBypass,
      ),
    );

    assert.isUndefined(
      yieldsTo(
        target,
        [target, other],
        new Map<number, QueueOwner>(),
        new Set<number>([3, 7]),
        'main',
        noBypass,
      ),
    );
  });

  test('does not count one paused by skip-ci', () => {
    const other = pullRequest({ number: 3, labels: [queued, skipCi] });

    assert.isUndefined(
      yieldsTo(
        target,
        [target, other],
        new Map<number, QueueOwner>([[3, worker]]),
        new Set<number>([3, 7]),
        'main',
        noBypass,
      ),
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

const noBypass: ReadonlyMap<number, string> = new Map<number, string>();
