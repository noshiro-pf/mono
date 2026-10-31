import { asGroupId, type GraphNodeId, type GroupId } from '../domain/index.mjs';
import {
  arrowKeyDelta,
  defaultDirection,
  dragPosition,
  moveNodesTo,
  nodesBounds,
  NUDGE_STEP,
  NUDGE_STEP_LARGE,
  PLACEMENT_GAP,
  placeNodes,
  positionsOf,
  scaleArrangement,
} from './dag-layout.mjs';
import type { LaidOutEdge, LaidOutNode } from './graph-layout.mjs';
import type { Point } from './pan-zoom.mjs';

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

const edgeAM: LaidOutEdge = {
  id: 'a->m',
  from: 'task:a',
  to: 'milestone:m',
  label: '',
  implied: false,
} as const;

describe(placeNodes, () => {
  test('puts a node where it was put by hand, and the rest where ELK did', () => {
    const positions: ReadonlyMap<GraphNodeId, Point> = new Map<
      GraphNodeId,
      Point
    >([['task:a', { x: -10, y: 300 }]]);

    assert.deepStrictEqual(placeNodes([nodeA, nodeM], [], positions), [
      { ...nodeA, x: -10, y: 300 },
      nodeM,
    ]);
  });

  test('ignores the position of a node that no longer exists', () => {
    const positions: ReadonlyMap<GraphNodeId, Point> = new Map<
      GraphNodeId,
      Point
    >([['task:gone', { x: 1, y: 2 }]]);

    assert.deepStrictEqual(placeNodes([nodeA], [], positions), [nodeA]);
  });

  test('is ELK’s layout as it is while no node was put anywhere', () => {
    const over = { ...nodeM, x: 30, y: 30 } as const;

    assert.deepStrictEqual(
      placeNodes([nodeA, over], [], new Map<GraphNodeId, Point>()),
      [nodeA, over],
    );
  });

  test('moves a node put nowhere off a node put by hand, to the nearest place clear of it', () => {
    const positions: ReadonlyMap<GraphNodeId, Point> = new Map<
      GraphNodeId,
      Point
    >([['task:a', { x: 200, y: 30 }]]);

    // Above `a`, as close as `PLACEMENT_GAP` allows: closer than below, to the
    // left or to the right.
    assert.deepStrictEqual(placeNodes([nodeA, nodeM], [], positions), [
      { ...nodeA, x: 200, y: 30 },
      { ...nodeM, x: 200, y: 30 - nodeM.height - PLACEMENT_GAP },
    ]);
  });

  test('moves a node put nowhere as far as the nodes it is joined to were moved', () => {
    const positions: ReadonlyMap<GraphNodeId, Point> = new Map<
      GraphNodeId,
      Point
    >([['task:a', { x: 24, y: 324 }]]);

    assert.deepStrictEqual(placeNodes([nodeA, nodeM], [edgeAM], positions), [
      { ...nodeA, x: 24, y: 324 },
      { ...nodeM, x: 200, y: 330 },
    ]);
  });

  test('moves a node put nowhere as far as the nodes of its group were moved', () => {
    const positions: ReadonlyMap<GraphNodeId, Point> = new Map<
      GraphNodeId,
      Point
    >([['task:a', { x: 24, y: 324 }]]);

    assert.deepStrictEqual(
      placeNodes([nodeA, nodeM], [], positions, [
        { id: asGroupId('g'), members: ['task:a', 'milestone:m'] },
      ]),
      [
        { ...nodeA, x: 24, y: 324 },
        { ...nodeM, x: 200, y: 330 },
      ],
    );
  });

  test('keeps the nodes put nowhere clear of each other, below on a tie', () => {
    const first: LaidOutNode = { ...nodeA, id: 'task:b', x: 0, y: 0 } as const;

    const second: LaidOutNode = {
      ...nodeA,
      id: 'task:c',
      x: 50,
      y: 0,
    } as const;

    const positions: ReadonlyMap<GraphNodeId, Point> = new Map<
      GraphNodeId,
      Point
    >([['task:gone', { x: 1, y: 2 }]]);

    assert.deepStrictEqual(placeNodes([first, second], [], positions), [
      first,
      { ...second, y: first.height + PLACEMENT_GAP },
    ]);
  });
});

describe(moveNodesTo, () => {
  test('moves the nodes `positions` has, and leaves the rest', () => {
    const positions: ReadonlyMap<GraphNodeId, Point> = new Map<
      GraphNodeId,
      Point
    >([
      ['task:a', { x: -10, y: 300 }],
      ['task:gone', { x: 1, y: 2 }],
    ]);

    assert.deepStrictEqual(moveNodesTo([nodeA, nodeM], positions), [
      { ...nodeA, x: -10, y: 300 },
      nodeM,
    ]);
  });
});

describe(positionsOf, () => {
  test('is every node’s top-left corner, by id', () => {
    assert.deepStrictEqual(
      positionsOf([nodeA, nodeM]),
      new Map<GraphNodeId, Point>([
        ['task:a', { x: 24, y: 24 }],
        ['milestone:m', { x: 200, y: 30 }],
      ]),
    );
  });
});

describe(scaleArrangement, () => {
  test('multiplies where every node and every frame is, and keeps the direction', () => {
    const g = asGroupId('g');

    assert.deepStrictEqual(
      scaleArrangement(
        {
          direction: 'down',
          positions: new Map<GraphNodeId, Point>([
            ['task:a', { x: 10, y: -20 }],
          ]),
          groupPositions: new Map<GroupId, Point>([[g, { x: 4, y: 6 }]]),
        },
        { x: 1.5, y: 2 },
      ),
      {
        direction: 'down',
        positions: new Map<GraphNodeId, Point>([['task:a', { x: 15, y: -40 }]]),
        groupPositions: new Map<GroupId, Point>([[g, { x: 6, y: 12 }]]),
      },
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
