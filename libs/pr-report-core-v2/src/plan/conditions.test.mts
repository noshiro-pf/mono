// cspell:ignore unlabel
import {
  attemptCondition,
  conditionVerdict,
  markRefired,
  NOT_STARTED_GRACE_MS,
  observeConditions,
  OUT_OF_SYNC_GRACE_MS,
  type Condition,
} from './conditions.mjs';

const HEADS = new Map<number, string>([
  [1, 'a'],
  [2, 'b'],
]);

const unread = { number: 1, head: 'a', kind: 'checks-unread' } as const;

const pushFailed = { number: 2, head: 'b', kind: 'push-failed' } as const;

describe(observeConditions, () => {
  test('counts one met again, begins one met first, and clears one not met', () => {
    const first = observeConditions([], [unread], HEADS, 100);

    assert.deepStrictEqual(first, [
      { ...unread, firstEpochMs: 100, count: 1, refired: false },
    ]);

    const second = observeConditions(first, [unread, unread], HEADS, 200);

    assert.deepStrictEqual(second, [
      { ...unread, firstEpochMs: 100, count: 2, refired: false },
    ]);

    assert.deepStrictEqual(observeConditions(second, [], HEADS, 300), []);
  });

  test('leaves an attempted one, unless its pull request moved or went', () => {
    const failed = attemptCondition([], pushFailed, true, 100);

    assert.deepStrictEqual(observeConditions(failed, [], HEADS, 200), failed);

    assert.deepStrictEqual(
      observeConditions(failed, [], new Map<number, string>([[2, 'c']]), 200),
      [],
    );

    assert.deepStrictEqual(
      observeConditions(failed, [], new Map<number, string>(), 200),
      [],
    );
  });
});

describe(attemptCondition, () => {
  test('counts a failure, and clears on success', () => {
    const once = attemptCondition([], pushFailed, true, 100);

    const twice = attemptCondition(once, pushFailed, true, 200);

    assert.deepStrictEqual(twice, [
      { ...pushFailed, firstEpochMs: 100, count: 2, refired: false },
    ]);

    assert.deepStrictEqual(attemptCondition(twice, pushFailed, false, 300), []);
  });
});

const condition = (
  kind: Condition['kind'],
  count: number,
  refired = false,
): Condition =>
  ({
    number: 1,
    head: 'a',
    kind,
    firstEpochMs: 0,
    count,
    refired,
  }) as const;

describe(conditionVerdict, () => {
  test('sets aside unread checks after five snapshots, unless the default branch is unread too', () => {
    assert.deepStrictEqual(
      conditionVerdict(condition('checks-unread', 4), 0, false),
      {
        kind: 'wait',
      },
    );

    assert.deepStrictEqual(
      conditionVerdict(condition('checks-unread', 5), 0, false),
      {
        kind: 'set-aside',
        reason: 'read-failed',
      },
    );

    assert.deepStrictEqual(
      conditionVerdict(condition('checks-unread', 9), 0, true),
      {
        kind: 'wait',
      },
    );
  });

  test('sets aside a head out of sync after ten minutes', () => {
    assert.deepStrictEqual(
      conditionVerdict(
        condition('head-out-of-sync', 1),
        OUT_OF_SYNC_GRACE_MS - 1,
        false,
      ),
      { kind: 'wait' },
    );

    assert.deepStrictEqual(
      conditionVerdict(
        condition('head-out-of-sync', 1),
        OUT_OF_SYNC_GRACE_MS,
        false,
      ),
      { kind: 'set-aside', reason: 'head-out-of-sync' },
    );
  });

  test('refires checks not started once, then sets aside after five more minutes', () => {
    const grace = NOT_STARTED_GRACE_MS;

    assert.deepStrictEqual(
      conditionVerdict(condition('checks-not-started', 1), grace - 1, false),
      { kind: 'wait' },
    );

    assert.deepStrictEqual(
      conditionVerdict(condition('checks-not-started', 1), grace, false),
      { kind: 'refire' },
    );

    assert.deepStrictEqual(
      conditionVerdict(condition('checks-not-started', 1, true), grace, false),
      { kind: 'wait' },
    );

    assert.deepStrictEqual(
      conditionVerdict(
        condition('checks-not-started', 1, true),
        2 * grace,
        false,
      ),
      { kind: 'set-aside', reason: 'checks-not-started' },
    );
  });

  test('sets aside after three failed pushes, arms or label removals', () => {
    for (const kind of [
      'push-failed',
      'arm-failed',
      'unlabel-failed',
    ] as const) {
      assert.deepStrictEqual(conditionVerdict(condition(kind, 2), 0, false), {
        kind: 'wait',
      });

      assert.deepStrictEqual(conditionVerdict(condition(kind, 3), 0, false), {
        kind: 'set-aside',
        reason: kind,
      });
    }
  });
});

describe(markRefired, () => {
  test('marks the one condition', () => {
    const notStarted = {
      number: 1,
      head: 'a',
      kind: 'checks-not-started',
    } as const;

    const met = observeConditions([], [notStarted, unread], HEADS, 0);

    assert.deepStrictEqual(
      markRefired(met, notStarted).map(({ refired }) => refired),
      [true, false],
    );
  });
});
