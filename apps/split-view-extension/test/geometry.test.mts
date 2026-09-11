import {
  computeGeometry,
  dropTargetAt,
  paneNode,
  splitNode,
  type Rect,
} from '../src/index.mjs';

const wholeStage: Rect = { left: 0, top: 0, width: 200, height: 100 } as const;

describe('computeGeometry', () => {
  test('gives a lone pane the whole wholeStage and no divider', () => {
    assert.deepStrictEqual(computeGeometry(paneNode(0), wholeStage, 6), {
      panes: [{ paneId: 0, rect: wholeStage }],
      splitters: [],
    });
  });

  test('takes the gutter out of the space the panes divide', () => {
    const result = computeGeometry(
      splitNode('row', paneNode(0), paneNode(1)),
      wholeStage,
      6,
    );

    assert.deepStrictEqual(result.panes, [
      { paneId: 0, rect: { left: 0, top: 0, width: 97, height: 100 } },
      { paneId: 1, rect: { left: 103, top: 0, width: 97, height: 100 } },
    ]);

    assert.deepStrictEqual(result.splitters, [
      {
        path: [],
        axis: 'row',
        rect: { left: 97, top: 0, width: 6, height: 100 },
        nodeRect: wholeStage,
      },
    ]);
  });

  test('stacks the children of a column split', () => {
    const result = computeGeometry(
      splitNode('column', paneNode(0), paneNode(1)),
      wholeStage,
      0,
    );

    assert.deepStrictEqual(result.panes, [
      { paneId: 0, rect: { left: 0, top: 0, width: 200, height: 50 } },
      { paneId: 1, rect: { left: 0, top: 50, width: 200, height: 50 } },
    ]);
  });

  test('honours the ratio', () => {
    const result = computeGeometry(
      splitNode('row', paneNode(0), paneNode(1), 0.25),
      wholeStage,
      0,
    );

    assert.deepStrictEqual(result.panes, [
      { paneId: 0, rect: { left: 0, top: 0, width: 50, height: 100 } },
      { paneId: 1, rect: { left: 50, top: 0, width: 150, height: 100 } },
    ]);
  });

  test('addresses every divider of a 2x2 grid by its path', () => {
    const result = computeGeometry(
      splitNode(
        'row',
        splitNode('column', paneNode(0), paneNode(1)),
        splitNode('column', paneNode(2), paneNode(3)),
      ),
      wholeStage,
      0,
    );

    assert.deepStrictEqual(
      result.panes.map((entry) => entry.paneId),
      [0, 1, 2, 3],
    );

    assert.deepStrictEqual(
      result.splitters.map((splitter) => splitter.path),
      [['first'], ['second'], []],
    );

    assert.deepStrictEqual(
      result.panes.map((entry) => entry.rect),
      [
        { left: 0, top: 0, width: 100, height: 50 },
        { left: 0, top: 50, width: 100, height: 50 },
        { left: 100, top: 0, width: 100, height: 50 },
        { left: 100, top: 50, width: 100, height: 50 },
      ],
    );

    // The two horizontal dividers are each half the stage wide, and the
    // vertical one runs its whole height: a grid nested the other way round
    // would have that the other way round too.
    assert.deepStrictEqual(
      result.splitters.map((splitter) => [splitter.axis, splitter.nodeRect]),
      [
        ['column', { left: 0, top: 0, width: 100, height: 100 }],
        ['column', { left: 100, top: 0, width: 100, height: 100 }],
        ['row', wholeStage],
      ],
    );
  });
});

describe('dropTargetAt', () => {
  // Two panes side by side, 100x100 each, no gutter.
  const geometry = computeGeometry(
    splitNode('row', paneNode(0), paneNode(1)),
    { left: 0, top: 0, width: 200, height: 100 },
    0,
  );

  test('the middle of a pane is a swap', () => {
    assert.deepStrictEqual(dropTargetAt(geometry, { x: 150, y: 50 }, 0), {
      paneId: 1,
      zone: 'center',
      indicator: { left: 100, top: 0, width: 100, height: 100 },
    });
  });

  test('each edge is that side, and the indicator is the half it would take', () => {
    assert.deepStrictEqual(dropTargetAt(geometry, { x: 110, y: 50 }, 0), {
      paneId: 1,
      zone: 'left',
      indicator: { left: 100, top: 0, width: 50, height: 100 },
    });

    assert.deepStrictEqual(dropTargetAt(geometry, { x: 195, y: 50 }, 0), {
      paneId: 1,
      zone: 'right',
      indicator: { left: 150, top: 0, width: 50, height: 100 },
    });

    assert.deepStrictEqual(dropTargetAt(geometry, { x: 150, y: 5 }, 0), {
      paneId: 1,
      zone: 'top',
      indicator: { left: 100, top: 0, width: 100, height: 50 },
    });

    assert.deepStrictEqual(dropTargetAt(geometry, { x: 150, y: 95 }, 0), {
      paneId: 1,
      zone: 'bottom',
      indicator: { left: 100, top: 50, width: 100, height: 50 },
    });
  });

  test('a corner belongs to the nearer of the two edges', () => {
    assert.deepStrictEqual(
      dropTargetAt(geometry, { x: 110, y: 102 }, 0)?.zone,
      undefined,
    );

    assert.deepStrictEqual(
      dropTargetAt(geometry, { x: 105, y: 90 }, 0)?.zone,
      'left',
    );

    assert.deepStrictEqual(
      dropTargetAt(geometry, { x: 120, y: 97 }, 0)?.zone,
      'bottom',
    );
  });

  test('the pane being dragged is not a target', () => {
    assert.deepStrictEqual(
      dropTargetAt(geometry, { x: 50, y: 50 }, 0),
      undefined,
    );
  });

  test('nothing outside the panes is', () => {
    assert.deepStrictEqual(
      dropTargetAt(geometry, { x: 500, y: 50 }, 0),
      undefined,
    );
  });
});
