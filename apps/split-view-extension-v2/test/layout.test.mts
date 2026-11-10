// cspell:ignore fppp rfpp rppp -- layouts in the notation of `src/core/layout/spec.mts`

import {
  computeGeometry,
  dividerKeyOf,
  dividerValue,
  dropTargetAt,
  evenChain,
  firstPxAfterKey,
  fixedSplit,
  formatLayoutSpec,
  insertBeside,
  layoutPresets,
  maxPaneCount,
  movePaneBeside,
  paneIdsOf,
  paneLeaf,
  parseLayoutSpec,
  presetOf,
  removePane,
  resizeAt,
  split,
  splitAt,
  swapPanes,
} from '../src/index.mjs';

const grid = split(
  'row',
  split('column', paneLeaf(0), paneLeaf(1)),
  split('column', paneLeaf(2), paneLeaf(3)),
);

describe('tree', () => {
  test('paneIdsOf lists leaves first before second', () => {
    expect(paneIdsOf(grid)).toStrictEqual([0, 1, 2, 3]);
  });

  test('split clamps the ratio', () => {
    expect(split('row', paneLeaf(0), paneLeaf(1), 2)).toMatchObject({
      ratio: 0.95,
    });

    expect(split('row', paneLeaf(0), paneLeaf(1), -1)).toMatchObject({
      ratio: 0.05,
    });

    expect(split('row', paneLeaf(0), paneLeaf(1), Number.NaN)).toMatchObject({
      ratio: 0.5,
    });
  });

  test('insertBeside puts a pane on the side asked for', () => {
    expect(insertBeside(paneLeaf(0), 0, 'left', 1)).toStrictEqual(
      split('row', paneLeaf(1), paneLeaf(0)),
    );

    expect(insertBeside(paneLeaf(0), 0, 'bottom', 1)).toStrictEqual(
      split('column', paneLeaf(0), paneLeaf(1)),
    );
  });

  test('removePane gives the sibling the space and keeps the last pane', () => {
    expect(paneIdsOf(removePane(grid, 1) ?? paneLeaf(-1))).toStrictEqual([
      0, 2, 3,
    ]);

    expect(removePane(paneLeaf(0), 0)).toBeUndefined();

    expect(removePane(grid, 9)).toBe(grid);
  });

  test('swapPanes exchanges places and ignores absent panes', () => {
    expect(paneIdsOf(swapPanes(grid, 0, 3))).toStrictEqual([3, 1, 2, 0]);

    expect(swapPanes(grid, 0, 9)).toBe(grid);
  });

  test('movePaneBeside takes a pane out and attaches it', () => {
    const moved = movePaneBeside(grid, 0, 3, 'right');

    expect(paneIdsOf(moved)).toStrictEqual([1, 2, 3, 0]);

    expect(movePaneBeside(grid, 0, 0, 'right')).toBe(grid);
  });

  test('resizeAt sets a ratio, or the held size, and keeps identity', () => {
    const resized = resizeAt(grid, ['first'], 300, 1000);

    expect(splitAt(resized, ['first'])?.ratio).toBe(0.3);

    expect(resizeAt(resized, ['first'], 300, 1000)).toBe(resized);

    const held = fixedSplit('row', paneLeaf(0), paneLeaf(1), {
      child: 'second',
      px: 200,
    });

    expect(splitAt(resizeAt(held, [], 700, 1000), [])?.fixed).toStrictEqual({
      child: 'second',
      px: 300,
    });
  });

  test('evenChain gives every node the same share of its split', () => {
    const three = evenChain('row', [paneLeaf(0), paneLeaf(1), paneLeaf(2)]);

    expect(three).toStrictEqual(
      split('row', paneLeaf(0), split('row', paneLeaf(1), paneLeaf(2)), 1 / 3),
    );
  });
});

describe('presets', () => {
  test('each preset has as many leaves as it says', () => {
    for (const preset of layoutPresets) {
      expect(paneIdsOf(preset.build((slot) => slot))).toStrictEqual(
        Array.from({ length: preset.paneCount }, (_, index) => index),
      );
    }
  });

  test('presetOf finds by id', () => {
    expect(presetOf('rows-3')?.paneCount).toBe(3);

    expect(presetOf('nope')).toBeUndefined();
  });
});

describe('layout spec', () => {
  test('round-trips ratios and held sizes', () => {
    const tree = split(
      'row',
      fixedSplit('column', paneLeaf(0), paneLeaf(1), {
        child: 'first',
        px: 240,
      }),
      paneLeaf(2),
      0.333,
    );

    const spec = formatLayoutSpec(tree);

    expect(spec).toBe('r33.3c240fppp');

    expect(parseLayoutSpec(spec)).toStrictEqual(
      split(
        'row',
        fixedSplit('column', paneLeaf(0), paneLeaf(1), {
          child: 'first',
          px: 240,
        }),
        paneLeaf(2),
        0.333,
      ),
    );
  });

  test('a grid is rcppcpp', () => {
    expect(formatLayoutSpec(grid)).toBe('rcppcpp');

    // Case and spaces do not matter. cspell:ignore RCPP
    expect(parseLayoutSpec(' RCPP CPP ')).toStrictEqual(grid);
  });

  test.each([
    '',
    'r',
    'rp',
    'rppp',
    'r1.2.3pp',
    'r.5pp',
    'r5.fpp',
    'rfpp',
    'x',
  ])('refuses %j', (spec) => {
    expect(parseLayoutSpec(spec)).toBeUndefined();
  });

  test('takes as many panes as a split view may have, and no more', () => {
    expect(
      parseLayoutSpec(
        `${'r'.repeat(maxPaneCount - 1)}${'p'.repeat(maxPaneCount)}`,
      ),
    ).toBeDefined();

    expect(
      parseLayoutSpec(
        `${'r'.repeat(maxPaneCount)}${'p'.repeat(maxPaneCount + 1)}`,
      ),
    ).toBeUndefined();

    // Refused before it is parsed, so it cannot overflow the stack.
    expect(
      parseLayoutSpec(`${'r'.repeat(20_000)}${'p'.repeat(20_001)}`),
    ).toBeUndefined();
  });
});

describe('geometry', () => {
  const bounds = { left: 0, top: 0, width: 1006, height: 506 } as const;

  test('lays out panes and dividers with the gutter between', () => {
    const geometry = computeGeometry(grid, bounds, 6);

    expect(geometry.panes).toStrictEqual([
      { paneId: 0, rect: { left: 0, top: 0, width: 500, height: 250 } },
      { paneId: 1, rect: { left: 0, top: 256, width: 500, height: 250 } },
      { paneId: 2, rect: { left: 506, top: 0, width: 500, height: 250 } },
      { paneId: 3, rect: { left: 506, top: 256, width: 500, height: 250 } },
    ]);

    expect(geometry.dividers.map(({ path }) => path)).toStrictEqual([
      ['first'],
      ['second'],
      [],
    ]);
  });

  test('a held size stays within the draggable range', () => {
    const held = fixedSplit('row', paneLeaf(0), paneLeaf(1), {
      child: 'first',
      px: 5000,
    });

    const [first] = computeGeometry(held, bounds, 6).panes;

    expect(first?.rect.width).toBe(950);
  });

  test('dropTargetAt picks a side near an edge and swaps in the middle', () => {
    const geometry = computeGeometry(grid, bounds, 6);

    expect(dropTargetAt(geometry, { x: 750, y: 120 }, 0)?.zone).toBe('center');

    expect(dropTargetAt(geometry, { x: 510, y: 120 }, 0)).toStrictEqual({
      paneId: 2,
      zone: 'left',
      indicator: { left: 506, top: 0, width: 250, height: 250 },
    });

    expect(dropTargetAt(geometry, { x: 10, y: 10 }, 0)).toBeUndefined();
  });

  test('divider keys move by 2% and to the ends', () => {
    const divider = computeGeometry(grid, bounds, 6).dividers.at(-1);

    assert.isDefined(divider);

    expect(dividerValue(divider)).toStrictEqual({ now: 50, min: 5, max: 95 });

    expect(firstPxAfterKey(divider, 'increase')).toBe(520);

    expect(firstPxAfterKey(divider, 'decrease')).toBe(480);

    expect(firstPxAfterKey(divider, 'min')).toBe(50);

    expect(firstPxAfterKey(divider, 'max')).toBe(950);
  });

  test('dividerKeyOf follows the axis', () => {
    expect(dividerKeyOf('row', 'ArrowRight')).toBe('increase');

    expect(dividerKeyOf('row', 'ArrowDown')).toBeUndefined();

    expect(dividerKeyOf('column', 'ArrowUp')).toBe('decrease');

    expect(dividerKeyOf('column', 'Home')).toBe('min');

    expect(dividerKeyOf('column', 'End')).toBe('max');
  });
});
