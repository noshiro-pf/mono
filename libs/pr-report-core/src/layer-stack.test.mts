import {
  decideSpeculation,
  layerStandings,
  mayBuildAbove,
  type LayerStatus,
} from './layer-stack.mjs';
import type { BuiltQueueLayer } from './queue-layers.mjs';

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

describe(layerStandings, () => {
  test('says what the worker does with each layer, as it decides it', () => {
    assert.deepStrictEqual(
      layerStandings([GREEN, RUNNING, NOT_DISPATCHED].map(plain)),
      ['green', 'running', 'to-dispatch'],
    );

    // A layer is dispatched only once every job below it has started.
    assert.deepStrictEqual(
      layerStandings([GREEN, STARTING, NOT_DISPATCHED].map(plain)),
      ['green', 'running', 'waits'],
    );

    assert.deepStrictEqual(
      layerStandings([NOT_DISPATCHED, NOT_DISPATCHED].map(plain)),
      ['to-dispatch', 'waits'],
    );
  });

  test('sets aside a red first layer and drops what stands on it', () => {
    assert.deepStrictEqual(
      layerStandings([RED, RUNNING, NOT_DISPATCHED].map(plain)),
      ['set-aside', 'dropped', 'dropped'],
    );

    assert.deepStrictEqual(layerStandings([GREEN, RED, RUNNING].map(plain)), [
      'green',
      'red',
      'dropped',
    ]);
  });

  // Its failure may be the layer below's, which is still running.
  test('drops nothing over a red layer standing on one still running', () => {
    assert.deepStrictEqual(
      layerStandings([RUNNING, RED, RUNNING, NOT_DISPATCHED].map(plain)),
      ['running', 'red', 'running', 'waits'],
    );
  });

  test('says which layer the worker no longer dispatches', () => {
    assert.deepStrictEqual(
      layerStandings([
        plain(GREEN),
        { status: NOT_DISPATCHED, cancelledTooOften: true },
        plain(NOT_DISPATCHED),
      ]),
      ['green', 'stalled', 'waits'],
    );
  });
});

/** A layer whose workflows were never cancelled too often. */
const plain = (
  status: LayerStatus,
): Readonly<{ status: LayerStatus; cancelledTooOften: boolean }> =>
  ({ status, cancelledTooOften: false }) as const;

const HEAD = 'a'.repeat(40);

const GREEN: LayerStatus = { kind: 'green' } as const;

const RED: LayerStatus = {
  kind: 'red',
  name: 'code-check.yml',
  link: 'L',
} as const;

const RUNNING: LayerStatus = { kind: 'running', queued: false } as const;

/** Running with a job not started yet. */
const STARTING: LayerStatus = { kind: 'running', queued: true } as const;

const NOT_DISPATCHED: LayerStatus = { kind: 'not-dispatched' } as const;

const built = (
  number: number,
  trees: Readonly<{ parentTree: string; tree: string }>,
): BuiltQueueLayer =>
  ({
    number,
    head: HEAD,
    tip: `tip-${number}`,
    parent: 'main-commit',
    builtAt: 0,
    ...trees,
  }) as const;
