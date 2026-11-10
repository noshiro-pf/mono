import {
  isStackable,
  numberOfQueueLayerBranch,
  queueLayerOfMessage,
  queueLayerTrailer,
  stackedAhead,
  stackedLayerParent,
  withStackedAbove,
  type BuiltQueueLayer,
  type LayerCandidate,
} from './queue-layers.mjs';
import type { QueueStanding } from './queue-order.mjs';

// The worker's release order (`releaseOrder` in `pr-merge-queue`) and the Pull
// Requests Manager's queue (`pickOrder`) both put this first.
describe(stackedAhead, () => {
  const context = {
    mayStayAhead: () => true,
    defaultBranch: 'main',
    isBypass: () => false,
  } as const;

  // #9 on #5 on `main`, stacked before #2 and #7 became candidates.
  const built = [
    layer(9, { tip: 'tip-5', tree: 'tree-5' }),
    layer(5, { tip: 'main', tree: 'main-tree' }),
  ] as const;

  test('keeps the stack from the base up, in the order it was stacked', () => {
    assert.deepStrictEqual(
      stackedAhead(
        [candidate(2), candidate(5), candidate(7), candidate(9)],
        built,
        'main-tree',
        context,
      ).map(({ number }) => number),
      [5, 9],
    );
  });

  test('stops at a layer whose pull request moved, left, or may not stay ahead', () => {
    assert.deepStrictEqual(
      stackedAhead(
        [candidate(5, { headRefOid: 'b'.repeat(40) }), candidate(9)],
        built,
        'main-tree',
        context,
      ),
      [],
    );

    assert.deepStrictEqual(
      stackedAhead([candidate(9)], built, 'main-tree', context),
      [],
    );

    assert.deepStrictEqual(
      stackedAhead([candidate(5), candidate(9)], built, 'main-tree', {
        ...context,
        mayStayAhead: ({ number }) => number !== 9,
      }).map(({ number }) => number),
      [5],
    );
  });

  test('keeps nothing on a tree the stack does not stand on', () => {
    assert.deepStrictEqual(
      stackedAhead([candidate(5), candidate(9)], built, 'another', context),
      [],
    );
  });

  // What goes into a release is the order's to say.
  test('keeps nothing the order puts after the version pull request', () => {
    assert.deepStrictEqual(
      stackedAhead(
        [
          candidate(5),
          candidate(3, { headRefName: 'changeset-release/main' }),
          candidate(9),
        ],
        built,
        'main-tree',
        context,
      ).map(({ number }) => number),
      [5],
    );
  });
});

describe(withStackedAbove, () => {
  test('puts a stacked pull request right after the one it is stacked on', () => {
    assert.deepStrictEqual(
      withStackedAbove(
        [candidate(2), candidate(5), candidate(7)],
        [above(9, 5)],
      ).map(({ number }) => number),
      [2, 5, 9, 7],
    );
  });

  test('follows a stack up, and puts what is on one layer in number order', () => {
    assert.deepStrictEqual(
      withStackedAbove(
        [candidate(5), candidate(7)],
        [above(12, 5), above(11, 9), above(9, 5)],
      ).map(({ number }) => number),
      [5, 9, 11, 12, 7],
    );
  });

  test('leaves out what is stacked on no candidate', () => {
    assert.deepStrictEqual(
      withStackedAbove([candidate(5)], [above(9, 8), above(10, 9)]).map(
        ({ number }) => number,
      ),
      [5],
    );
  });

  // A base cycle of branches is not a stack anyone can land.
  test('takes each once, whatever cycle the bases make', () => {
    assert.deepStrictEqual(
      withStackedAbove(
        [candidate(5)],
        [above(9, 5), above(10, 9), above(9, 10)],
      ).map(({ number }) => number),
      [5, 9, 10],
    );
  });
});

describe(stackedLayerParent, () => {
  const graph = {
    dependencies: new Map<number, readonly number[]>([
      [9, [5]],
      [10, [5, 3]],
      [11, [5, 4]],
    ]),
    openNumbers: new Set<number>([3, 5, 9, 10, 11]),
  } as const;

  test('is the pull request it is stacked on', () => {
    assert.strictEqual(
      stackedLayerParent({ number: 9, fromFork: false }, stacked(5), graph),
      5,
    );
  });

  // #4 is no longer open; #3 is.
  test('is nothing while it waits on anything else still open', () => {
    assert.strictEqual(
      stackedLayerParent({ number: 11, fromFork: false }, stacked(5), graph),
      5,
    );

    assert.isUndefined(
      stackedLayerParent({ number: 10, fromFork: false }, stacked(5), graph),
    );
  });

  test("is nothing for a fork's, one on a cycle, or one not stacked", () => {
    assert.isUndefined(
      stackedLayerParent({ number: 9, fromFork: true }, stacked(5), graph),
    );

    assert.isUndefined(
      stackedLayerParent(
        { number: 9, fromFork: false },
        stacked(5, true),
        graph,
      ),
    );

    assert.isUndefined(
      stackedLayerParent(
        { number: 9, fromFork: false },
        { kind: 'candidate' },
        graph,
      ),
    );
  });
});

describe(isStackable, () => {
  test('is not the version pull request, one only a bypass merges, or a fork’s', () => {
    assert.isTrue(isStackable(candidate(1), 'main', false));

    assert.isFalse(
      isStackable(
        candidate(1, { headRefName: 'changeset-release/main' }),
        'main',
        false,
      ),
    );

    assert.isFalse(isStackable(candidate(1), 'main', true));

    assert.isFalse(
      isStackable(candidate(1, { isCrossRepository: true }), 'main', false),
    );
  });
});

describe(queueLayerOfMessage, () => {
  test('reads back the trailer the layer’s commit carries', () => {
    const layer_ = { number: 12, head: 'a'.repeat(40) } as const;

    assert.deepStrictEqual(
      queueLayerOfMessage(
        `queue layer: pull request 12\n\n${queueLayerTrailer(layer_)}\n`,
      ),
      layer_,
    );
  });

  test('reads nothing from a message without one, or with a short head', () => {
    assert.isUndefined(queueLayerOfMessage('fix: something'));

    assert.isUndefined(queueLayerOfMessage('Queue-Layer: 12 abc'));
  });
});

describe(numberOfQueueLayerBranch, () => {
  test('is the pull request of a layer branch, and nothing for another', () => {
    assert.strictEqual(numberOfQueueLayerBranch('queue/pr-12'), 12);

    assert.isUndefined(numberOfQueueLayerBranch('queue/pr-012'));

    assert.isUndefined(numberOfQueueLayerBranch('feature/12'));
  });
});

/** A pull request whose head is its number, in 40 hexadecimal digits. */
const candidate = (
  number: number,
  fields: Partial<LayerCandidate> = {},
): LayerCandidate =>
  ({
    number,
    headRefOid: number.toString(16).padStart(40, '0'),
    headRefName: `branch-${number}`,
    isCrossRepository: false,
    ...fields,
  }) as const;

/** {@link candidate} `number`, stacked on `on`. */
const above = (
  number: number,
  on: number,
): Readonly<{ pr: LayerCandidate; on: number }> =>
  ({ pr: candidate(number), on }) as const;

/** The standing of a pull request stacked on `on`. */
const stacked = (on: number, cyclic = false): QueueStanding =>
  ({ kind: 'stacked', on, cyclic }) as const;

/** The layer of {@link candidate} `number`, on `below`. */
const layer = (
  number: number,
  below: Readonly<{ tip: string; tree: string }>,
): BuiltQueueLayer =>
  ({
    number,
    head: number.toString(16).padStart(40, '0'),
    tip: `tip-${number}`,
    tree: `tree-${number}`,
    parent: below.tip,
    parentTree: below.tree,
    builtAt: 1,
  }) as const;
