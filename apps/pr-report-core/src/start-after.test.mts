import {
  decideStartStates,
  inheritStartAfter,
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

describe(inheritStartAfter, () => {
  test('an open pull request an issue names is merged after, as if declared', () => {
    assert.deepStrictEqual(
      inheritStartAfter({
        pulls: [
          { number: 10, closes: [1] },
          { number: 20, closes: [] },
        ],
        startAfterOf: new Map([[1, [20]]]),
        openIssues: new Set([1]),
      }),
      new Map([
        [10, { mergeAfter: [20], notStarted: [] }],
        [20, { mergeAfter: [], notStarted: [] }],
      ]),
    );
  });

  test('an open issue named stands for the open pull requests closing it', () => {
    assert.deepStrictEqual(
      inheritStartAfter({
        pulls: [
          { number: 10, closes: [1] },
          { number: 21, closes: [2] },
          { number: 22, closes: [2] },
        ],
        startAfterOf: new Map([[1, [2]]]),
        openIssues: new Set([1, 2]),
      }).get(10),
      { mergeAfter: [21, 22], notStarted: [] },
    );
  });

  test('an open issue nobody has started holds nothing, and is said to be open', () => {
    assert.deepStrictEqual(
      inheritStartAfter({
        pulls: [{ number: 10, closes: [1] }],
        startAfterOf: new Map([[1, [2]]]),
        openIssues: new Set([1, 2]),
      }).get(10),
      { mergeAfter: [], notStarted: [2] },
    );
  });

  test('what is done, abandoned or unknown constrains nothing', () => {
    // #3 is neither an open pull request nor an open issue: merged, closed,
    // or a number nobody described.
    assert.deepStrictEqual(
      inheritStartAfter({
        pulls: [{ number: 10, closes: [1] }],
        startAfterOf: new Map([[1, [3]]]),
        openIssues: new Set([1]),
      }).get(10),
      { mergeAfter: [], notStarted: [] },
    );
  });

  test('never itself: neither named, nor as what closes the issue named', () => {
    // #10 closes both #1 and #2, so #1's wait for #2 is this very change.
    assert.deepStrictEqual(
      inheritStartAfter({
        pulls: [
          { number: 10, closes: [1, 2] },
          { number: 11, closes: [3] },
        ],
        startAfterOf: new Map([
          [1, [2]],
          [3, [11]],
        ]),
        openIssues: new Set([1, 2, 3]),
      }),
      new Map([
        [10, { mergeAfter: [], notStarted: [] }],
        [11, { mergeAfter: [], notStarted: [] }],
      ]),
    );
  });

  test('every issue closed contributes, each number once, lowest first', () => {
    assert.deepStrictEqual(
      inheritStartAfter({
        pulls: [
          { number: 10, closes: [1, 2] },
          { number: 30, closes: [] },
          { number: 20, closes: [5] },
        ],
        startAfterOf: new Map([
          [1, [30, 5, 6]],
          [2, [5, 30, 6]],
        ]),
        openIssues: new Set([1, 2, 5, 6]),
      }).get(10),
      { mergeAfter: [20, 30], notStarted: [6] },
    );
  });

  test('an issue whose body was not read declares nothing', () => {
    assert.deepStrictEqual(
      inheritStartAfter({
        pulls: [{ number: 10, closes: [1] }],
        startAfterOf: new Map(),
        openIssues: new Set([1]),
      }).get(10),
      { mergeAfter: [], notStarted: [] },
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
