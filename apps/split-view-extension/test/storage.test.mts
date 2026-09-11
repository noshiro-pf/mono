import { createPane, parseWorkspaceState } from '../src/index.mjs';

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
