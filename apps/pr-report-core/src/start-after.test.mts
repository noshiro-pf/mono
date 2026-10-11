import {
  decideStartStates,
  referenceStatusOf,
  type ReferenceStatus,
} from './start-after.mjs';

describe(referenceStatusOf, () => {
  test('anything open is waited for, in either API’s spelling', () => {
    assert.strictEqual(
      referenceStatusOf({
        kind: 'issue',
        state: 'OPEN',
        stateReason: undefined,
      }),
      'waiting',
    );

    assert.strictEqual(
      referenceStatusOf({ kind: 'pull-request', state: 'open', merged: false }),
      'waiting',
    );
  });

  test('a merged pull request is done, and one closed unmerged is abandoned', () => {
    assert.strictEqual(
      referenceStatusOf({
        kind: 'pull-request',
        state: 'MERGED',
        merged: true,
      }),
      'done',
    );

    assert.strictEqual(
      referenceStatusOf({
        kind: 'pull-request',
        state: 'CLOSED',
        merged: false,
      }),
      'abandoned',
    );
  });

  test('an issue is done when closed as completed, or with no reason recorded', () => {
    assert.strictEqual(
      referenceStatusOf({
        kind: 'issue',
        state: 'CLOSED',
        stateReason: 'COMPLETED',
      }),
      'done',
    );

    assert.strictEqual(
      referenceStatusOf({
        kind: 'issue',
        state: 'closed',
        stateReason: undefined,
      }),
      'done',
    );
  });

  test('an issue closed as not planned or as a duplicate is abandoned', () => {
    assert.strictEqual(
      referenceStatusOf({
        kind: 'issue',
        state: 'CLOSED',
        stateReason: 'NOT_PLANNED',
      }),
      'abandoned',
    );

    assert.strictEqual(
      referenceStatusOf({
        kind: 'issue',
        state: 'closed',
        stateReason: 'duplicate',
      }),
      'abandoned',
    );
  });
});

describe(decideStartStates, () => {
  test('an issue that declares nothing is free', () => {
    assert.deepStrictEqual(
      decideStartStates([{ number: 1, startAfter: [] }], known([])),
      new Map([[1, 'free']]),
    );
  });

  test('an issue that names an open issue in the list is blocked by it', () => {
    assert.deepStrictEqual(
      decideStartStates(
        [
          { number: 1, startAfter: [] },
          { number: 2, startAfter: [1] },
        ],
        known([]),
      ),
      new Map([
        [1, 'free'],
        [2, 'blocked'],
      ]),
    );
  });

  test('an issue whose every named item is done is ready', () => {
    assert.deepStrictEqual(
      decideStartStates(
        [{ number: 3, startAfter: [1, 2] }],
        known([
          [1, 'done'],
          [2, 'done'],
        ]),
      ),
      new Map([[3, 'ready']]),
    );
  });

  test('waiting outranks an abandoned or unknown item, which outranks done', () => {
    assert.deepStrictEqual(
      decideStartStates(
        [
          { number: 10, startAfter: [1, 2, 3] },
          { number: 11, startAfter: [1, 2] },
          { number: 12, startAfter: [1, 4] },
        ],
        known([
          [1, 'done'],
          [2, 'abandoned'],
          [3, 'waiting'],
        ]),
      ),
      new Map([
        [10, 'blocked'],
        [11, 'attention'],
        [12, 'attention'],
      ]),
    );
  });

  test('is not transitive: only what an issue names itself counts', () => {
    assert.deepStrictEqual(
      decideStartStates(
        [
          { number: 1, startAfter: [9] },
          { number: 2, startAfter: [1] },
          { number: 3, startAfter: [8] },
        ],
        known([
          [8, 'done'],
          [9, 'waiting'],
        ]),
      ),
      new Map([
        [1, 'blocked'],
        [2, 'blocked'],
        [3, 'ready'],
      ]),
    );
  });

  test('issues on a cycle are a cycle, and what waits on one is blocked', () => {
    assert.deepStrictEqual(
      decideStartStates(
        [
          { number: 1, startAfter: [2] },
          { number: 2, startAfter: [1] },
          { number: 3, startAfter: [3] },
          { number: 4, startAfter: [1] },
        ],
        known([]),
      ),
      new Map([
        [1, 'cycle'],
        [2, 'cycle'],
        [3, 'cycle'],
        [4, 'blocked'],
      ]),
    );
  });
});

/** `statusOf` for {@link decideStartStates}: what is not listed is unknown. */
const known = (
  statuses: readonly (readonly [number, ReferenceStatus])[],
): ((number: number) => ReferenceStatus) => {
  const byNumber = new Map(statuses);

  return (number) => byNumber.get(number) ?? 'unknown';
};
