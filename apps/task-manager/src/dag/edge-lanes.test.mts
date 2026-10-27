import type { AxisBox, AxisPoint } from './edge-geometry.mjs';
import { LANE_GAP, orderPorts, separateLanes } from './edge-lanes.mjs';

const at = (main: number, cross: number): AxisPoint =>
  ({ main, cross }) as const;

const box = (
  mainStart: number,
  mainEnd: number,
  crossStart: number,
  crossEnd: number,
): AxisBox => ({ mainStart, mainEnd, crossStart, crossEnd }) as const;

// Two edges that come up to the line at 100 and go back down off it, one
// round the other: `outer` from 60 to 300, `inner` from 100 to 250.
const outer = [
  at(0, 0),
  at(60, 0),
  at(60, 100),
  at(300, 100),
  at(300, 0),
  at(400, 0),
] as const;

const inner = [
  at(0, 10),
  at(100, 10),
  at(100, 100),
  at(250, 100),
  at(250, 10),
  at(400, 10),
] as const;

describe(separateLanes, () => {
  test('draws two edges on one line side by side, the inner one nearer the side they turn to', () => {
    const [outerMoved, innerMoved] = separateLanes(
      [
        { id: 'outer', corners: outer },
        { id: 'inner', corners: inner },
      ],
      [],
      4,
    );

    assert.deepStrictEqual(outerMoved, [
      at(0, 0),
      at(60, 0),
      at(60, 100 + LANE_GAP / 2),
      at(300, 100 + LANE_GAP / 2),
      at(300, 0),
      at(400, 0),
    ]);

    assert.deepStrictEqual(innerMoved, [
      at(0, 10),
      at(100, 10),
      at(100, 100 - LANE_GAP / 2),
      at(250, 100 - LANE_GAP / 2),
      at(250, 10),
      at(400, 10),
    ]);
  });

  test('gives the same lanes whatever the order of the paths', () => {
    const forward = separateLanes(
      [
        { id: 'outer', corners: outer },
        { id: 'inner', corners: inner },
      ],
      [],
      4,
    );

    const backward = separateLanes(
      [
        { id: 'inner', corners: inner },
        { id: 'outer', corners: outer },
      ],
      [],
      4,
    );

    assert.deepStrictEqual(backward.toReversed(), forward);
  });

  test('keeps the lanes clear of a node beside the line', () => {
    // Its side, less the clearance, at 101: the lanes go below it.
    const [outerMoved, innerMoved] = separateLanes(
      [
        { id: 'outer', corners: outer },
        { id: 'inner', corners: inner },
      ],
      [box(120, 200, 105, 150)],
      4,
    );

    assert.strictEqual(outerMoved?.[2]?.cross, 101);

    assert.strictEqual(innerMoved?.[2]?.cross, 101 - LANE_GAP);
  });

  test('puts the lanes closer where the nodes on both sides leave less room', () => {
    const [outerMoved, innerMoved] = separateLanes(
      [
        { id: 'outer', corners: outer },
        { id: 'inner', corners: inner },
      ],
      [box(120, 200, 105, 150), box(120, 200, 50, 94)],
      4,
    );

    assert.strictEqual(outerMoved?.[2]?.cross, 101);

    assert.strictEqual(innerMoved?.[2]?.cross, 98);
  });

  test('moves nothing that is already too close to a node, nor the ends', () => {
    const paths = [
      { id: 'outer', corners: outer },
      { id: 'inner', corners: inner },
    ] as const;

    assert.deepStrictEqual(separateLanes(paths, [box(120, 200, 98, 150)], 4), [
      outer,
      inner,
    ]);

    // The first stretch of each, on one line, leaves a port.
    const sharedStart = [
      { id: 'a', corners: [at(0, 0), at(100, 0), at(100, 50), at(200, 50)] },
      { id: 'b', corners: [at(0, 0), at(80, 0), at(80, -50), at(200, -50)] },
    ] as const;

    assert.deepStrictEqual(
      separateLanes(sharedStart, [], 4),
      sharedStart.map(({ corners }) => corners),
    );
  });
});

describe(orderPorts, () => {
  // The target's side from 20 to 80 across, its ports at 40 and 60: the
  // edge from above given the lower port, the one from below the upper.
  const fromAbove = [at(0, 0), at(376, 0), at(376, 60), at(400, 60)] as const;

  const fromBelow = [
    at(0, 100),
    at(376, 100),
    at(376, 40),
    at(400, 40),
  ] as const;

  const boxes = new Map<string, AxisBox>([
    ['target', box(400, 500, 20, 80)],
    ['above', box(-100, 0, -30, 30)],
    ['below', box(-100, 0, 70, 130)],
  ]);

  test('swaps the ports of two edges that would cross in front of the node', () => {
    assert.deepStrictEqual(
      orderPorts(
        [
          { from: 'above', to: 'target', corners: fromAbove },
          { from: 'below', to: 'target', corners: fromBelow },
        ],
        boxes,
        4,
      ),
      [
        [at(0, 0), at(376, 0), at(376, 40), at(400, 40)],
        [at(0, 100), at(376, 100), at(376, 60), at(400, 60)],
      ],
    );
  });

  test('leaves them as they are where they are in order', () => {
    const inOrder = [
      {
        from: 'above',
        to: 'target',
        corners: [at(0, 0), at(376, 0), at(376, 40), at(400, 40)],
      },
      {
        from: 'below',
        to: 'target',
        corners: [at(0, 100), at(376, 100), at(376, 60), at(400, 60)],
      },
    ] as const;

    assert.deepStrictEqual(
      orderPorts(inOrder, boxes, 4),
      inOrder.map(({ corners }) => corners),
    );
  });

  test('leaves them where a new port would take one past another node', () => {
    const blocked = new Map<string, AxisBox>([
      ...boxes,
      ['between', box(380, 395, 30, 38)],
    ]);

    assert.deepStrictEqual(
      orderPorts(
        [
          { from: 'above', to: 'target', corners: fromAbove },
          { from: 'below', to: 'target', corners: fromBelow },
        ],
        blocked,
        4,
      ),
      [fromAbove, fromBelow],
    );
  });
});
