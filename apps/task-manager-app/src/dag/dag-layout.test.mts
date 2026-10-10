import { type GraphNodeId } from '../domain/index.mjs';
import {
  arrowKeyDelta,
  defaultDirection,
  dragPosition,
  nodesBounds,
  NUDGE_STEP,
  NUDGE_STEP_LARGE,
  placeNodes,
  positionsOf,
} from './dag-layout.mjs';
import { type LaidOutNode } from './graph-layout.mjs';
import { type Point } from './pan-zoom.mjs';

const nodeA: LaidOutNode = {
  id: 'task:a',
  kind: 'task',
  x: 24,
  y: 24,
  width: 100,
  height: 50,
} as const;

const nodeM: LaidOutNode = {
  id: 'milestone:m',
  kind: 'milestone',
  x: 200,
  y: 30,
  width: 80,
  height: 40,
} as const;

describe(placeNodes, () => {
  test('puts a node where it was put by hand, and the rest where ELK did', () => {
    const positions: ReadonlyMap<GraphNodeId, Point> = new Map([
      ['task:a', { x: -10, y: 300 }],
    ]);

    assert.deepStrictEqual(placeNodes([nodeA, nodeM], positions), [
      { ...nodeA, x: -10, y: 300 },
      nodeM,
    ]);
  });

  test('ignores the position of a node that no longer exists', () => {
    const positions: ReadonlyMap<GraphNodeId, Point> = new Map([
      ['task:gone', { x: 1, y: 2 }],
    ]);

    assert.deepStrictEqual(placeNodes([nodeA], positions), [nodeA]);
  });
});

describe(positionsOf, () => {
  test('is every node’s top-left corner, by id', () => {
    assert.deepStrictEqual(
      positionsOf([nodeA, nodeM]),
      new Map([
        ['task:a', { x: 24, y: 24 }],
        ['milestone:m', { x: 200, y: 30 }],
      ]),
    );
  });
});

describe(dragPosition, () => {
  test('moves the node as far as the pointer at a scale of 1', () => {
    assert.deepStrictEqual(
      dragPosition({ x: 10, y: 20 }, { x: 100, y: 100 }, { x: 130, y: 90 }, 1),
      { x: 40, y: 10 },
    );
  });

  test('divides the pointer’s movement by the zoom', () => {
    assert.deepStrictEqual(
      dragPosition({ x: 10, y: 20 }, { x: 0, y: 0 }, { x: 60, y: -40 }, 2),
      { x: 40, y: 0 },
    );

    assert.deepStrictEqual(
      dragPosition({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 5 }, 0.5),
      { x: 20, y: 10 },
    );
  });

  test('lands on whole units', () => {
    assert.deepStrictEqual(
      dragPosition({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 10 }, 3),
      { x: 3, y: 3 },
    );
  });

  test('does not move for a zero scale rather than fly off', () => {
    assert.deepStrictEqual(
      dragPosition({ x: 5, y: 6 }, { x: 0, y: 0 }, { x: 10, y: 10 }, 0),
      { x: 5, y: 6 },
    );
  });
});

describe(arrowKeyDelta, () => {
  test('moves by a step in the arrow’s direction', () => {
    assert.deepStrictEqual(arrowKeyDelta('ArrowRight', false), {
      x: NUDGE_STEP,
      y: 0,
    });

    assert.deepStrictEqual(arrowKeyDelta('ArrowLeft', false), {
      x: -NUDGE_STEP,
      y: 0,
    });

    assert.deepStrictEqual(arrowKeyDelta('ArrowUp', false), {
      x: 0,
      y: -NUDGE_STEP,
    });

    assert.deepStrictEqual(arrowKeyDelta('ArrowDown', false), {
      x: 0,
      y: NUDGE_STEP,
    });
  });

  test('moves further with Shift', () => {
    assert.deepStrictEqual(arrowKeyDelta('ArrowDown', true), {
      x: 0,
      y: NUDGE_STEP_LARGE,
    });

    assert.isAbove(NUDGE_STEP_LARGE, NUDGE_STEP);
  });

  test('is nothing for any other key', () => {
    assert.isUndefined(arrowKeyDelta('Enter', false));

    assert.isUndefined(arrowKeyDelta('a', true));
  });
});

describe(nodesBounds, () => {
  test('encloses every node, with the margin around', () => {
    assert.deepStrictEqual(
      nodesBounds([{ ...nodeA, x: -50, y: 100 }, nodeM], 10),
      { x: -60, y: 20, width: 350, height: 140 },
    );
  });

  test('is empty for no nodes', () => {
    assert.deepStrictEqual(nodesBounds([], 10), {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    });
  });
});

describe(defaultDirection, () => {
  test('grows to the right on a wide screen and down on a narrow one', () => {
    assert.strictEqual(defaultDirection(false), 'right');

    assert.strictEqual(defaultDirection(true), 'down');
  });
});
