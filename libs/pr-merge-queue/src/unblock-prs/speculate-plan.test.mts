import { Arr } from 'ts-data-forge';
import {
  buildableLayers,
  cancelledTooOften,
  decideSpeculation,
  desiredLayers,
  dropActionOf,
  isStuck,
  LAYER_TIMEOUT_MS,
  layerBranch,
  layerMessage,
  layerOfMessage,
  layerTrailer,
  matchLayers,
  MAX_DISPATCHES,
  mayBuildAbove,
  numberOfLayerBranch,
  type BuiltLayer,
  type LayerStatus,
} from './speculate-plan.mjs';
import type { PullRequest } from './types.mjs';

describe(desiredLayers, () => {
  const context = {
    defaultBranch: 'main',
    bypass: new Map<number, string>(),
    depth: 3,
  } as const;

  test('takes the leading candidates, in order, up to the depth', () => {
    assert.deepStrictEqual(
      desiredLayers([pr(5), pr(3), pr(9), pr(11)], context),
      [layer(5), layer(3), layer(9)],
    );
  });

  // Each is released on its own once the layers before it have merged.
  test('stops at the version pull request, one only a bypass merges, or a fork', () => {
    assert.deepStrictEqual(
      desiredLayers(
        [pr(5), pr(6, { headRefName: 'changeset-release/main' }), pr(7)],
        context,
      ),
      [layer(5)],
    );

    assert.deepStrictEqual(
      desiredLayers([pr(5), pr(6), pr(7)], {
        ...context,
        bypass: new Map<number, string>([[6, 'only the author owns it']]),
      }),
      [layer(5)],
    );

    assert.deepStrictEqual(
      desiredLayers([pr(5, { isCrossRepository: true }), pr(6)], context),
      [],
    );
  });
});

describe(matchLayers, () => {
  test('keeps the layers that stand on the base, in order, and builds the rest', () => {
    const first = built(5, { parentTree: 'main-tree', tree: 't5' });

    const second = built(3, { parentTree: 't5', tree: 't3' });

    assert.deepStrictEqual(
      matchLayers({
        desired: [layer(5), layer(3), layer(9)],
        built: [second, first],
        baseTree: 'main-tree',
      }),
      { kept: [first, second], toBuild: [layer(9)], stale: [] },
    );
  });

  // After the first layer's pull request merged, `main` has the first layer's
  // tree, and the second layer stands on it unchanged.
  test('keeps a layer on a base whose tree it was built on, whatever the commit', () => {
    const second = built(3, { parentTree: 't5', tree: 't3' });

    assert.deepStrictEqual(
      matchLayers({
        desired: [layer(3)],
        built: [built(5, { parentTree: 'old', tree: 't5' }), second],
        baseTree: 't5',
      }),
      {
        kept: [second],
        toBuild: [],
        stale: [built(5, { parentTree: 'old', tree: 't5' })],
      },
    );
  });

  test('builds again from a layer whose base or head moved, with everything above it', () => {
    const first = built(5, { parentTree: 'main-tree', tree: 't5' });

    const second = built(3, { parentTree: 't5', tree: 't3' });

    assert.deepStrictEqual(
      matchLayers({
        desired: [layer(5), layer(3)],
        built: [first, second],
        baseTree: 'moved-main',
      }),
      { kept: [], toBuild: [layer(5), layer(3)], stale: [first, second] },
    );

    assert.deepStrictEqual(
      matchLayers({
        desired: [{ number: 5, head: 'f'.repeat(40) }, layer(3)],
        built: [first, second],
        baseTree: 'main-tree',
      }),
      {
        kept: [],
        toBuild: [{ number: 5, head: 'f'.repeat(40) }, layer(3)],
        stale: [first, second],
      },
    );
  });
});

describe(decideSpeculation, () => {
  const layers = [
    built(5, { parentTree: 'main-tree', tree: 't5' }),
    built(3, { parentTree: 't5', tree: 't3' }),
    built(9, { parentTree: 't3', tree: 't9' }),
  ] as const;

  const red: LayerStatus = {
    kind: 'red',
    name: 'code-check.yml',
    link: 'L',
  } as const;

  test('releases the first candidate once its layer is green', () => {
    assert.isTrue(
      decideSpeculation({
        layers,
        statuses: [GREEN, RUNNING, NOT_DISPATCHED],
        firstCandidate: 5,
      }).release,
    );

    assert.isFalse(
      decideSpeculation({
        layers,
        statuses: [RUNNING, RUNNING, NOT_DISPATCHED],
        firstCandidate: 5,
      }).release,
    );
  });

  // The version pull request, one only a bypass merges, or one whose commit
  // conflicts: the release runs its checks, or finds the conflict.
  test('releases a first candidate that has no layer to wait for', () => {
    assert.isTrue(
      decideSpeculation({ layers: [], statuses: [], firstCandidate: 7 })
        .release,
    );
  });

  test('dispatches the next layer once every job below it has started', () => {
    assert.strictEqual(
      decideSpeculation({
        layers,
        statuses: [GREEN, RUNNING, NOT_DISPATCHED],
        firstCandidate: 5,
      }).dispatch,
      2,
    );

    assert.isUndefined(
      decideSpeculation({
        layers,
        statuses: [GREEN, { kind: 'running', queued: true }, NOT_DISPATCHED],
        firstCandidate: 5,
      }).dispatch,
    );

    assert.strictEqual(
      decideSpeculation({
        layers,
        statuses: [NOT_DISPATCHED, NOT_DISPATCHED, NOT_DISPATCHED],
        firstCandidate: 5,
      }).dispatch,
      0,
    );
  });

  test('dispatches nothing on top of a red layer, even one nobody owns yet', () => {
    assert.isUndefined(
      decideSpeculation({
        layers,
        statuses: [RUNNING, red, NOT_DISPATCHED],
        firstCandidate: 5,
      }).dispatch,
    );
  });

  test('sets aside the pull request of a red first layer, and drops the layers above it', () => {
    assert.deepStrictEqual(
      decideSpeculation({
        layers,
        statuses: [red, RUNNING, NOT_DISPATCHED],
        firstCandidate: 5,
      }),
      {
        setAside: { number: 5, head: HEAD, name: 'code-check.yml', link: 'L' },
        dropFrom: 1,
        dispatch: undefined,
        release: false,
      },
    );
  });

  // Reached on top of a pull request that has not merged, and that may not: it
  // is judged once it is first, on `main`'s tree or rebuilt on it.
  test('holds a red layer over green ones until it is first, and drops the layers above it', () => {
    assert.deepStrictEqual(
      decideSpeculation({
        layers,
        statuses: [GREEN, red, RUNNING],
        firstCandidate: 5,
      }),
      {
        setAside: undefined,
        dropFrom: 2,
        dispatch: undefined,
        release: true,
      },
    );
  });

  // Its failure may be the layer below's, which is still running.
  test('names nobody for a red layer over one still running', () => {
    const decided = decideSpeculation({
      layers,
      statuses: [RUNNING, red, NOT_DISPATCHED],
      firstCandidate: 5,
    });

    assert.isUndefined(decided.setAside);

    assert.isUndefined(decided.dropFrom);
  });
});

describe(mayBuildAbove, () => {
  test('is false only on top of a red layer over green ones', () => {
    assert.isTrue(mayBuildAbove([]));

    assert.isTrue(mayBuildAbove([GREEN, RUNNING]));

    // Whose it is is not known yet, and a layer built on it would wait anyway.
    assert.isTrue(mayBuildAbove([RUNNING, RED]));

    assert.isFalse(mayBuildAbove([RED]));

    assert.isFalse(mayBuildAbove([GREEN, RED]));
  });
});

describe(buildableLayers, () => {
  test('stops before the first layer whose old runs are still on its branch', () => {
    const toBuild = [layer(5), layer(3), layer(9)] as const;

    assert.deepStrictEqual(
      buildableLayers(toBuild, new Set<number>()),
      toBuild,
    );

    assert.deepStrictEqual(buildableLayers(toBuild, new Set<number>([3])), [
      layer(5),
    ]);

    assert.deepStrictEqual(buildableLayers(toBuild, new Set<number>([5])), []);

    assert.deepStrictEqual(
      buildableLayers(toBuild, new Set<number>([7])),
      toBuild,
    );
  });
});

describe(cancelledTooOften, () => {
  test('is a workflow cancelled as often as it may be dispatched', () => {
    const cancelled: readonly string[] = Array.from(
      { length: MAX_DISPATCHES },
      () => 'cancelled',
    );

    const onceLess = Arr.tail(cancelled);

    assert.isTrue(cancelledTooOften(cancelled));

    assert.isFalse(cancelledTooOften(onceLess));

    assert.isFalse(cancelledTooOften([...onceLess, 'success', null]));
  });
});

describe(dropActionOf, () => {
  const red = { status: 'completed', conclusion: 'failure' } as const;

  const green = { status: 'completed', conclusion: 'success' } as const;

  test('cancels a run still going, whatever it is', () => {
    const going = { status: 'in_progress', conclusion: null } as const;

    assert.strictEqual(dropActionOf(going, false), 'cancel');

    assert.strictEqual(dropActionOf(going, true), 'cancel');
  });

  test('deletes a finished run, so that no verdict of the layer is reused', () => {
    assert.strictEqual(dropActionOf(red, false), 'delete');

    assert.strictEqual(dropActionOf(green, false), 'delete');
  });

  test('keeps only what did not pass, for a pull request set aside for it', () => {
    assert.strictEqual(dropActionOf(red, true), 'keep');

    assert.strictEqual(dropActionOf(green, true), 'delete');
  });
});

describe(isStuck, () => {
  test('is a first layer running past the limit, from its oldest run still going', () => {
    assert.isTrue(isStuck(RUNNING, 0, LAYER_TIMEOUT_MS + 1));

    assert.isFalse(isStuck(RUNNING, 0, LAYER_TIMEOUT_MS));

    assert.isFalse(isStuck(RUNNING, undefined, LAYER_TIMEOUT_MS * 2));

    assert.isFalse(isStuck(GREEN, 0, LAYER_TIMEOUT_MS * 2));
  });
});

describe('layer branches and trailers', () => {
  test('round-trips a pull request number through its branch', () => {
    assert.strictEqual(layerBranch(42), 'queue/pr-42');

    assert.strictEqual(numberOfLayerBranch('queue/pr-42'), 42);

    for (const branch of ['queue/pr-', 'queue/pr-04', 'queue/x', 'pr-42']) {
      assert.isUndefined(numberOfLayerBranch(branch));
    }
  });

  test('round-trips a layer through its commit message', () => {
    const message = [
      'feat: something',
      '',
      'Body.',
      '',
      layerTrailer(layer(42)),
    ].join('\n');

    assert.deepStrictEqual(layerOfMessage(message), layer(42));

    assert.isUndefined(layerOfMessage('feat: something\n'));

    assert.isUndefined(layerOfMessage('Queue-Layer: 42 not-a-sha\n'));
  });

  // GitHub links `#N` in a pushed commit's message, on any branch, so each
  // rebuild of a layer would add to the timeline of the pull request it names.
  test('writes no pull request reference GitHub would link', () => {
    assert.notInclude(layerMessage(layer(42)), '#');

    assert.deepStrictEqual(layerOfMessage(layerMessage(layer(42))), layer(42));
  });
});

const HEAD = 'a'.repeat(40);

const GREEN: LayerStatus = { kind: 'green' } as const;

const RED: LayerStatus = {
  kind: 'red',
  name: 'code-check.yml',
  link: 'L',
} as const;

const RUNNING: LayerStatus = { kind: 'running', queued: false } as const;

const NOT_DISPATCHED: LayerStatus = { kind: 'not-dispatched' } as const;

const layer = (number: number): Readonly<{ number: number; head: string }> =>
  ({ number, head: HEAD }) as const;

const built = (
  number: number,
  trees: Readonly<{ parentTree: string; tree: string }>,
): BuiltLayer =>
  ({ ...layer(number), tip: `tip-${number}`, ...trees }) as const;

const pr = (
  number: number,
  overrides: Partial<PullRequest> = {},
): PullRequest =>
  ({
    number,
    id: `PR_${number}`,
    title: `#${number}`,
    body: '',
    state: 'OPEN',
    headRefName: `branch-${number}`,
    headRefOid: HEAD,
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'BEHIND',
    autoMergeRequest: null,
    labels: [],
    ...overrides,
  }) as const;
