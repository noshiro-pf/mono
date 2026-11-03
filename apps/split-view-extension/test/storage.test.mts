import type { ReadonlyRecord } from 'ts-type-forge';
import {
  createPane,
  fixedSplitNode,
  paneNode,
  parseWorkspaceState,
  splitNode,
} from '../src/index.mjs';

/** What one stored pane entry parses back to. */
const paneFrom = (stored: unknown): unknown =>
  parseWorkspaceState({
    root: { kind: 'pane', paneId: 0 },
    panes: [stored],
  })?.panes[0];

describe('parseWorkspaceState, on a pane', () => {
  test('reads a zoom back, clamped to the ladder', () => {
    assert.deepStrictEqual(paneFrom({ id: 0, zoom: 1.5 }), {
      ...createPane(0),
      zoom: 1.5,
    });

    assert.deepStrictEqual(paneFrom({ id: 0, zoom: 99 }), {
      ...createPane(0),
      zoom: 2,
    });
  });

  test('is unzoomed when the record has no zoom, which is every older one', () => {
    assert.deepStrictEqual(paneFrom({ id: 0 }), createPane(0));
  });
});

/** What one stored split's root parses back to. */
const rootFrom = (split: ReadonlyRecord<string, unknown>): unknown =>
  parseWorkspaceState({
    root: {
      kind: 'split',
      axis: 'row',
      first: { kind: 'pane', paneId: 0 },
      second: { kind: 'pane', paneId: 1 },
      ...split,
    },
    panes: [{ id: 0 }, { id: 1 }],
  })?.root;

describe('parseWorkspaceState, on a split', () => {
  test('reads a held child back', () => {
    assert.deepStrictEqual(
      rootFrom({ ratio: 0.5, fixed: { child: 'second', px: 740 } }),
      fixedSplitNode('row', paneNode(0), paneNode(1), {
        child: 'second',
        px: 740,
      }),
    );
  });

  test('drops a held child it cannot read, keeping the ratio', () => {
    assert.deepStrictEqual(
      rootFrom({ ratio: 0.7, fixed: { child: 'middle', px: 740 } }),
      splitNode('row', paneNode(0), paneNode(1), 0.7),
    );

    assert.deepStrictEqual(
      rootFrom({ ratio: 0.7, fixed: { child: 'first', px: 'wide' } }),
      splitNode('row', paneNode(0), paneNode(1), 0.7),
    );
  });
});
