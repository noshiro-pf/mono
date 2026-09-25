import {
  evenChain,
  formatLayoutSpec,
  layoutPresets,
  paneIdsOf,
  paneNode,
  parseLayoutSpec,
  splitNode,
  type LayoutNode,
  type PresetId,
} from '../src/index.mjs';

const preset = (presetId: PresetId): LayoutNode => {
  const found = layoutPresets.find((candidate) => candidate.id === presetId);

  if (found === undefined) {
    throw new Error(`no such preset: ${presetId}`);
  }

  return found.build((index) => index);
};

describe('formatLayoutSpec', () => {
  test('writes a pane as p', () => {
    assert.deepStrictEqual(formatLayoutSpec(paneNode(3)), 'p');
  });

  test('writes a split as its axis, its ratio in percent, then its children', () => {
    assert.deepStrictEqual(
      formatLayoutSpec(splitNode('row', paneNode(0), paneNode(1), 0.7)),
      'r70pp',
    );

    assert.deepStrictEqual(
      formatLayoutSpec(splitNode('column', paneNode(0), paneNode(1), 0.25)),
      'c25pp',
    );
  });

  test('leaves out a ratio of one half, the default', () => {
    assert.deepStrictEqual(formatLayoutSpec(preset('grid-2x2')), 'rcppcpp');

    assert.deepStrictEqual(formatLayoutSpec(preset('left-1-right-2')), 'rpcpp');
  });

  test('rounds a ratio to a tenth of a percent', () => {
    assert.deepStrictEqual(
      formatLayoutSpec(evenChain('row', [0, 1, 2])),
      'r33.3prpp',
    );

    assert.deepStrictEqual(
      formatLayoutSpec(splitNode('row', paneNode(0), paneNode(1), 0.123_456)),
      'r12.3pp',
    );
  });
});

describe('parseLayoutSpec', () => {
  test('numbers the panes in tree order, from zero', () => {
    assert.deepStrictEqual(
      parseLayoutSpec('rcppcpp'),
      splitNode(
        'row',
        splitNode('column', paneNode(0), paneNode(1)),
        splitNode('column', paneNode(2), paneNode(3)),
      ),
    );
  });

  test('reads a ratio as a percentage of the first child', () => {
    assert.deepStrictEqual(
      parseLayoutSpec('r70pp'),
      splitNode('row', paneNode(0), paneNode(1), 0.7),
    );

    assert.deepStrictEqual(
      parseLayoutSpec('c33.3pp'),
      splitNode('column', paneNode(0), paneNode(1), 0.333),
    );
  });

  test('clamps a ratio the way a dragged divider is clamped', () => {
    assert.deepStrictEqual(
      parseLayoutSpec('r0pp'),
      splitNode('row', paneNode(0), paneNode(1), 0.05),
    );

    assert.deepStrictEqual(
      parseLayoutSpec('r100pp'),
      splitNode('row', paneNode(0), paneNode(1), 0.95),
    );
  });

  test('is case-insensitive and ignores whitespace', () => {
    assert.deepStrictEqual(
      parseLayoutSpec(' R70 P P '),
      splitNode('row', paneNode(0), paneNode(1), 0.7),
    );
  });

  test('refuses anything that is not exactly one tree', () => {
    assert.deepStrictEqual(parseLayoutSpec(''), undefined);

    assert.deepStrictEqual(parseLayoutSpec('r'), undefined);

    assert.deepStrictEqual(parseLayoutSpec('rp'), undefined);

    assert.deepStrictEqual(parseLayoutSpec('rppp'), undefined);

    assert.deepStrictEqual(parseLayoutSpec('x'), undefined);

    assert.deepStrictEqual(parseLayoutSpec('70pp'), undefined);

    assert.deepStrictEqual(parseLayoutSpec('r7.pp'), undefined);
  });

  test('reads back what formatLayoutSpec wrote, for every preset', () => {
    const specs = layoutPresets.map(({ id }) => formatLayoutSpec(preset(id)));

    const reread = specs.map((spec) => {
      const parsed = parseLayoutSpec(spec);

      return parsed === undefined ? undefined : formatLayoutSpec(parsed);
    });

    assert.deepStrictEqual(reread, specs);

    // And the panes come back in the order the presets number them, which
    // is the order `url=` parameters are read in.
    assert.deepStrictEqual(
      specs.map((spec) => {
        const parsed = parseLayoutSpec(spec);

        return parsed === undefined ? undefined : paneIdsOf(parsed);
      }),
      layoutPresets.map(({ id }) => paneIdsOf(preset(id))),
    );
  });
});
