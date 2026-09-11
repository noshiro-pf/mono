import {
  computeGeometry,
  layoutPresets,
  paneIdsOf,
  paneNode,
  splitNode,
  type LayoutNode,
  type PresetId,
} from '../src/index.mjs';

/** Builds a preset with the slot index standing in for the pane id. */
const build = (presetId: PresetId): LayoutNode => {
  const preset = layoutPresets.find((candidate) => candidate.id === presetId);

  if (preset === undefined) {
    throw new Error(`no such preset: ${presetId}`);
  }

  return preset.build((index) => index);
};

describe('layoutPresets', () => {
  test('fills its slots in the order the tree reads them', () => {
    // `applyPreset` takes the slots from `paneIdsOf` of the tree it is
    // replacing, so a preset that laid them out in any other order would move
    // the panes around every time the same preset was applied twice.
    assert.deepStrictEqual(
      layoutPresets.map((preset) => paneIdsOf(build(preset.id))),
      layoutPresets.map((preset) =>
        Array.from({ length: preset.paneCount }, (_, index) => index),
      ),
    );
  });

  test('builds the 2x2 grid as a row of two columns', () => {
    assert.deepStrictEqual(
      build('grid-2x2'),
      splitNode(
        'row',
        splitNode('column', paneNode(0), paneNode(1)),
        splitNode('column', paneNode(2), paneNode(3)),
      ),
    );
  });

  test('gives every column of the 2x3 grid a divider of its own', () => {
    const { panes, splitters } = computeGeometry(
      build('grid-2x3'),
      { left: 0, top: 0, width: 300, height: 100 },
      0,
    );

    // Still three columns of two, which is the part the nesting must not
    // change.
    assert.deepStrictEqual(
      panes.map((entry) => entry.rect),
      [
        { left: 0, top: 0, width: 100, height: 50 },
        { left: 0, top: 50, width: 100, height: 50 },
        { left: 100, top: 0, width: 100, height: 50 },
        { left: 100, top: 50, width: 100, height: 50 },
        { left: 200, top: 0, width: 100, height: 50 },
        { left: 200, top: 50, width: 100, height: 50 },
      ],
    );

    // No horizontal divider spans the stage: each one divides one column, so
    // dragging it leaves the other columns where they are.
    assert.deepStrictEqual(
      splitters
        .filter((splitter) => splitter.axis === 'column')
        .map((splitter) => splitter.nodeRect.width),
      [100, 100, 100],
    );
  });
});
