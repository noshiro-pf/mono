import {
  DEFAULT_LAYOUT,
  DEFAULT_SHARE,
  layoutFromSearch,
  moveBlock,
  searchWithLayout,
  sharePercents,
  splitAt,
  withBoundaryAt,
  withColumns,
  withEvenShares,
  withHeight,
  withMode,
  withShare,
  withSplit,
  type BoundaryDrag,
  type Layout,
} from './layout.mjs';

describe(layoutFromSearch, () => {
  test('is the default without parameters', () => {
    assert.deepStrictEqual(layoutFromSearch(''), DEFAULT_LAYOUT);

    assert.deepStrictEqual(layoutFromSearch('?theme=dark'), DEFAULT_LAYOUT);
  });

  test('reads two columns, their blocks, the split and the heights', () => {
    assert.deepStrictEqual(
      layoutFromSearch(
        '?cols=2&left=issues&right=open.runs.merged&split=35&h.open=480',
      ),
      {
        columns: 2,
        left: ['issues'],
        right: ['open', 'runs', 'merged'],
        split: 35,
        heights: { open: 480 },
        mode: 'natural',
        shares: {},
      },
    );
  });

  test('reads the fill mode and the shares', () => {
    const read = layoutFromSearch('?mode=fill&s.open=250&s.issues=37.25');

    assert.strictEqual(read.mode, 'fill');

    assert.deepStrictEqual(read.shares, { open: 250, issues: 37.3 });

    assert.strictEqual(layoutFromSearch('?mode=bogus').mode, 'natural');
  });

  test('drops unknown and repeated blocks, and puts back the missing ones', () => {
    assert.deepStrictEqual(layoutFromSearch('?left=merged.bogus.merged').left, [
      'merged',
      'open',
      'runs',
      'issues',
    ]);
  });

  test('a URL written before the runs block puts it at the end of the left column', () => {
    assert.deepStrictEqual(
      layoutFromSearch('?cols=2&left=open.merged&right=issues'),
      {
        ...DEFAULT_LAYOUT,
        columns: 2,
        left: ['open', 'merged', 'runs'],
        right: ['issues'],
      },
    );
  });

  test('one column holds every block, whatever `right` says', () => {
    assert.deepStrictEqual(layoutFromSearch('?left=issues&right=open'), {
      ...DEFAULT_LAYOUT,
      left: ['issues', 'open', 'runs', 'merged'],
    });
  });

  test('an empty number is no number', () => {
    assert.deepStrictEqual(
      layoutFromSearch('?cols=2&split=&h.open='),
      withColumns(DEFAULT_LAYOUT, 2),
    );
  });

  test('clamps what is out of range, and ignores what is not a number', () => {
    assert.deepStrictEqual(
      layoutFromSearch('?cols=2&split=99&h.open=5&h.merged=abc&h.issues=99999'),
      {
        ...withColumns(DEFAULT_LAYOUT, 2),
        split: 80,
        heights: { open: 120, issues: 4000 },
      },
    );
  });
});

describe(searchWithLayout, () => {
  test('writes nothing for the default, and removes what was there', () => {
    assert.strictEqual(searchWithLayout('', DEFAULT_LAYOUT), '');

    assert.strictEqual(
      searchWithLayout(
        '?cols=2&left=open&right=runs.merged.issues',
        DEFAULT_LAYOUT,
      ),
      '',
    );
  });

  test('keeps the other parameters', () => {
    assert.strictEqual(
      searchWithLayout(
        '?theme=dark',
        withSplit(withColumns(DEFAULT_LAYOUT, 2), 60),
      ),
      '?theme=dark&cols=2&left=open&right=runs.merged.issues&split=60',
    );
  });

  test('reads back what it wrote', () => {
    const layout: Layout = {
      columns: 2,
      left: ['merged', 'runs'],
      right: ['issues', 'open'],
      split: 42,
      heights: { issues: 300, open: 640 },
      mode: 'fill',
      shares: { merged: 60, open: 140.5 },
    } as const;

    assert.deepStrictEqual(
      layoutFromSearch(searchWithLayout('?theme=light', layout)),
      layout,
    );
  });
});

describe(withColumns, () => {
  test('splits one column into two, the first block on the left', () => {
    assert.deepStrictEqual(withColumns(DEFAULT_LAYOUT, 2), {
      ...DEFAULT_LAYOUT,
      columns: 2,
      left: ['open'],
      right: ['runs', 'merged', 'issues'],
    });
  });

  test('keeps the columns it had when both already hold something', () => {
    const two: Layout = {
      ...DEFAULT_LAYOUT,
      columns: 2,
      left: ['open', 'issues'],
      right: ['runs', 'merged'],
    } as const;

    assert.deepStrictEqual(withColumns(withColumns(two, 2), 2), two);
  });

  test('joins two into one, left then right', () => {
    assert.deepStrictEqual(
      withColumns(
        {
          ...DEFAULT_LAYOUT,
          columns: 2,
          left: ['issues'],
          right: ['open', 'runs', 'merged'],
        },
        1,
      ),
      { ...DEFAULT_LAYOUT, left: ['issues', 'open', 'runs', 'merged'] },
    );
  });
});

describe(moveBlock, () => {
  test('moves within a column', () => {
    assert.deepStrictEqual(
      moveBlock(DEFAULT_LAYOUT, 'issues', { column: 0, index: 0 }).left,
      ['issues', 'open', 'runs', 'merged'],
    );

    assert.deepStrictEqual(
      moveBlock(DEFAULT_LAYOUT, 'open', { column: 0, index: 2 }).left,
      ['runs', 'merged', 'open', 'issues'],
    );
  });

  test('moves across columns', () => {
    const two = withColumns(DEFAULT_LAYOUT, 2);

    const moved = moveBlock(two, 'issues', { column: 0, index: 1 });

    assert.deepStrictEqual(
      [moved.left, moved.right],
      [
        ['open', 'issues'],
        ['runs', 'merged'],
      ],
    );
  });

  test('an index past the end is the end, and one column has only a left', () => {
    assert.deepStrictEqual(
      moveBlock(DEFAULT_LAYOUT, 'open', { column: 1, index: 9 }),
      { ...DEFAULT_LAYOUT, left: ['runs', 'merged', 'issues', 'open'] },
    );
  });
});

describe(withHeight, () => {
  test('sets, rounds and clamps a height, and clears it', () => {
    assert.deepStrictEqual(withHeight(DEFAULT_LAYOUT, 'open', 300.6).heights, {
      open: 301,
    });

    assert.deepStrictEqual(withHeight(DEFAULT_LAYOUT, 'open', 10).heights, {
      open: 120,
    });

    assert.deepStrictEqual(
      withHeight(withHeight(DEFAULT_LAYOUT, 'open', 300), 'open', undefined)
        .heights,
      {},
    );
  });
});

describe(withMode, () => {
  test('switches the mode, and keeps the heights and the shares for the way back', () => {
    const sized = withShare(
      withHeight(DEFAULT_LAYOUT, 'open', 300),
      'open',
      50,
    );

    const filled = withMode(sized, 'fill');

    assert.strictEqual(filled.mode, 'fill');

    assert.deepStrictEqual(withMode(filled, 'natural'), sized);
  });

  test('writes the mode and the shares into the query string', () => {
    assert.strictEqual(
      searchWithLayout(
        '',
        withShare(withMode(DEFAULT_LAYOUT, 'fill'), 'merged', 50),
      ),
      '?mode=fill&s.merged=50',
    );
  });
});

describe(withShare, () => {
  test('sets, rounds and clamps a share, and clears it', () => {
    assert.deepStrictEqual(withShare(DEFAULT_LAYOUT, 'open', 33.333).shares, {
      open: 33.3,
    });

    assert.deepStrictEqual(withShare(DEFAULT_LAYOUT, 'open', 1).shares, {
      open: 10,
    });

    assert.deepStrictEqual(withShare(DEFAULT_LAYOUT, 'open', 5000).shares, {
      open: 1000,
    });

    assert.deepStrictEqual(
      withShare(withShare(DEFAULT_LAYOUT, 'open', 50), 'open', undefined)
        .shares,
      {},
    );
  });
});

describe(withEvenShares, () => {
  test('gives the blocks the mean of their shares, which keeps their total', () => {
    const layout = withShare(
      withShare(DEFAULT_LAYOUT, 'open', 300),
      'merged',
      100,
    );

    assert.deepStrictEqual(withEvenShares(layout, ['open', 'merged']).shares, {
      open: 200,
      merged: 200,
    });
  });
});

describe(sharePercents, () => {
  test('is each block’s part of its column, in whole percent', () => {
    const layout = withShare(DEFAULT_LAYOUT, 'open', 2 * DEFAULT_SHARE);

    assert.deepStrictEqual(
      sharePercents(layout, ['open', 'merged', 'issues']),
      [50, 25, 25],
    );

    assert.deepStrictEqual(sharePercents(DEFAULT_LAYOUT, ['issues']), [100]);

    assert.deepStrictEqual(sharePercents(DEFAULT_LAYOUT, []), []);
  });
});

describe(withBoundaryAt, () => {
  const drag: BoundaryDrag = {
    upper: 'open',
    lower: 'merged',
    fromY: 500,
    upperHeight: 300,
    lowerHeight: 300,
    upperShare: 100,
    lowerShare: 100,
  } as const;

  test('moves the line between two blocks with the pointer, and keeps their total', () => {
    assert.deepStrictEqual(withBoundaryAt(DEFAULT_LAYOUT, drag, 560).shares, {
      open: 120,
      merged: 80,
    });

    assert.deepStrictEqual(withBoundaryAt(DEFAULT_LAYOUT, drag, 410).shares, {
      open: 70,
      merged: 130,
    });
  });

  test('leaves each block at least the least height', () => {
    const { shares } = withBoundaryAt(DEFAULT_LAYOUT, drag, 2000);

    assert.deepStrictEqual(shares, { open: 173.3, merged: 26.7 });
  });

  test('changes nothing for blocks not drawn', () => {
    assert.deepStrictEqual(
      withBoundaryAt(
        DEFAULT_LAYOUT,
        { ...drag, upperHeight: 0, lowerHeight: 0 },
        560,
      ),
      DEFAULT_LAYOUT,
    );
  });
});

describe(withSplit, () => {
  test('rounds and clamps', () => {
    assert.strictEqual(withSplit(DEFAULT_LAYOUT, 33.3).split, 33);

    assert.strictEqual(withSplit(DEFAULT_LAYOUT, 5).split, 20);

    assert.strictEqual(withSplit(DEFAULT_LAYOUT, 95).split, 80);
  });
});

describe(splitAt, () => {
  test('is where the pointer is across the layout, in percent', () => {
    assert.strictEqual(splitAt(300, { left: 100, width: 800 }), 25);
  });

  test('is nothing for a layout with no width', () => {
    assert.isUndefined(splitAt(300, { left: 100, width: 0 }));
  });
});
