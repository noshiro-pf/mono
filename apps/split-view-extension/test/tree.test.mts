import { Arr, Num } from 'ts-data-forge';
import {
  clampRatio,
  evenChain,
  insertPaneBeside,
  movePaneBeside,
  paneIdsOf,
  paneNode,
  removePaneAt,
  splitNode,
  splitPaneAt,
  swapPanesAt,
  updateRatioAt,
  type LayoutNode,
} from '../src/index.mjs';

const grid2x2: LayoutNode = splitNode(
  'row',
  splitNode('column', paneNode(0), paneNode(1)),
  splitNode('column', paneNode(2), paneNode(3)),
);

describe('paneIdsOf', () => {
  test('lists the panes down each column, then rightwards', () => {
    assert.deepStrictEqual(paneIdsOf(grid2x2), [0, 1, 2, 3]);
  });

  test('lists the only pane of a leaf', () => {
    assert.deepStrictEqual(paneIdsOf(paneNode(7)), [7]);
  });
});

describe('splitPaneAt', () => {
  test('replaces the named pane with a split of itself and the new pane', () => {
    const result = splitPaneAt(grid2x2, 1, 'row', 4);

    assert.deepStrictEqual(paneIdsOf(result), [0, 1, 4, 2, 3]);
  });

  test('leaves the tree alone when the pane is not in it', () => {
    assert.deepStrictEqual(splitPaneAt(grid2x2, 9, 'row', 4), grid2x2);
  });

  test('splits a lone pane into two', () => {
    assert.deepStrictEqual(
      splitPaneAt(paneNode(0), 0, 'row', 1),
      splitNode('row', paneNode(0), paneNode(1)),
    );
  });
});

describe('removePaneAt', () => {
  test('promotes the sibling into the space the split occupied', () => {
    assert.deepStrictEqual(
      removePaneAt(grid2x2, 1),
      splitNode(
        'row',
        paneNode(0),
        splitNode('column', paneNode(2), paneNode(3)),
      ),
    );
  });

  test('refuses to empty the tree', () => {
    assert.deepStrictEqual(removePaneAt(paneNode(0), 0), undefined);
  });

  test('leaves the tree alone when the pane is not in it', () => {
    assert.deepStrictEqual(removePaneAt(grid2x2, 9), grid2x2);
  });
});

describe('updateRatioAt', () => {
  test('sets the ratio of the root split when the path is empty', () => {
    assert.deepStrictEqual(
      updateRatioAt(grid2x2, [], 0.25),
      splitNode(
        'row',
        splitNode('column', paneNode(0), paneNode(1)),
        splitNode('column', paneNode(2), paneNode(3)),
        0.25,
      ),
    );
  });

  test('follows the path to a nested split', () => {
    assert.deepStrictEqual(
      updateRatioAt(grid2x2, ['second'], 0.75),
      splitNode(
        'row',
        splitNode('column', paneNode(0), paneNode(1)),
        splitNode('column', paneNode(2), paneNode(3), 0.75),
      ),
    );
  });

  test('clamps a ratio that would collapse a pane', () => {
    assert.deepStrictEqual(updateRatioAt(paneNode(0), [], 1.5), paneNode(0));

    assert.deepStrictEqual(
      updateRatioAt(splitNode('row', paneNode(0), paneNode(1)), [], 1.5),
      splitNode('row', paneNode(0), paneNode(1), 0.95),
    );
  });
});

describe('clampRatio', () => {
  test('keeps a usable ratio as it is', () => {
    assert.deepStrictEqual(clampRatio(0.4), 0.4);
  });

  test('bounds both edges', () => {
    assert.deepStrictEqual(clampRatio(-1), 0.05);

    assert.deepStrictEqual(clampRatio(2), 0.95);
  });

  test('falls back to the middle for a value that is not a number', () => {
    assert.deepStrictEqual(clampRatio(Number.NaN), 0.5);
  });
});

describe('evenChain', () => {
  test('gives three panes an equal share each', () => {
    assert.deepStrictEqual(
      evenChain('row', [0, 1, 2]),
      splitNode(
        'row',
        paneNode(0),
        splitNode('row', paneNode(1), paneNode(2)),
        Num.div(1, 3),
      ),
    );
  });

  test('is a leaf for a single pane', () => {
    assert.deepStrictEqual(evenChain('column', [5]), paneNode(5));
  });

  test('throws when given no panes', () => {
    expect(() => evenChain('row', [])).toThrow();
  });
});

describe('insertPaneBeside', () => {
  test('puts the new pane before the target on the left and top', () => {
    assert.deepStrictEqual(
      insertPaneBeside(paneNode(0), 0, 'left', 1),
      splitNode('row', paneNode(1), paneNode(0)),
    );

    assert.deepStrictEqual(
      insertPaneBeside(paneNode(0), 0, 'top', 1),
      splitNode('column', paneNode(1), paneNode(0)),
    );
  });

  test('puts it after the target on the right and bottom', () => {
    assert.deepStrictEqual(
      insertPaneBeside(paneNode(0), 0, 'right', 1),
      splitNode('row', paneNode(0), paneNode(1)),
    );

    assert.deepStrictEqual(
      insertPaneBeside(paneNode(0), 0, 'bottom', 1),
      splitNode('column', paneNode(0), paneNode(1)),
    );
  });

  test('is what splitting a pane is', () => {
    assert.deepStrictEqual(
      splitPaneAt(grid2x2, 1, 'row', 4),
      insertPaneBeside(grid2x2, 1, 'right', 4),
    );
  });
});

describe('swapPanesAt', () => {
  test('exchanges two panes wherever they are in the tree', () => {
    assert.deepStrictEqual(
      swapPanesAt(grid2x2, 0, 3),
      splitNode(
        'row',
        splitNode('column', paneNode(3), paneNode(1)),
        splitNode('column', paneNode(2), paneNode(0)),
      ),
    );
  });

  test('keeps the shape of the tree, so the rectangles are the ones swapped', () => {
    assert.deepStrictEqual(paneIdsOf(swapPanesAt(grid2x2, 0, 3)), [3, 1, 2, 0]);
  });

  test('leaves the tree alone for a pane it does not have', () => {
    assert.isTrue(swapPanesAt(grid2x2, 0, 9) === grid2x2);

    assert.isTrue(swapPanesAt(grid2x2, 0, 0) === grid2x2);
  });
});

describe('movePaneBeside', () => {
  test('detaches the pane and re-attaches it to the side named', () => {
    // 0 leaves the left column — 1 takes the whole of it — and lands under 3.
    assert.deepStrictEqual(
      movePaneBeside(grid2x2, 0, 3, 'bottom'),
      splitNode(
        'row',
        paneNode(1),
        splitNode(
          'column',
          paneNode(2),
          splitNode('column', paneNode(3), paneNode(0)),
        ),
      ),
    );
  });

  test('keeps every pane, which is what makes it a move', () => {
    assert.deepStrictEqual(
      Arr.toSorted(
        paneIdsOf(movePaneBeside(grid2x2, 0, 3, 'left')),
        (a, b) => a - b,
      ),
      [0, 1, 2, 3],
    );
  });

  test('works when the tree is two panes', () => {
    assert.deepStrictEqual(
      movePaneBeside(splitNode('row', paneNode(0), paneNode(1)), 0, 1, 'top'),
      splitNode('column', paneNode(0), paneNode(1)),
    );
  });

  test('leaves the tree alone for a pane it does not have, or for itself', () => {
    assert.isTrue(movePaneBeside(grid2x2, 0, 9, 'left') === grid2x2);

    assert.isTrue(movePaneBeside(grid2x2, 0, 0, 'left') === grid2x2);
  });
});
