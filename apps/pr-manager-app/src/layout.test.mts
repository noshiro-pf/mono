import {
  columnsOf,
  columnWidths,
  DEFAULT_LAYOUT,
  DEFAULT_SHARE,
  layoutFromSearch,
  moveBlock,
  searchWithLayout,
  sharePercents,
  splitAt,
  withBoundaryAt,
  withColumns,
  withEvenLine,
  withEvenShares,
  withHeight,
  withLineAt,
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
        middle: [],
        right: ['open', 'runs', 'merged'],
        split: 35,
        lines: DEFAULT_LAYOUT.lines,
        heights: { open: 480 },
        mode: 'natural',
        shares: {},
      },
    );
  });

  test('reads three columns, their blocks and the lines between them', () => {
    assert.deepStrictEqual(
      layoutFromSearch(
        '?cols=3&left=open&middle=runs.merged&right=issues&lines=25-70',
      ),
      {
        ...DEFAULT_LAYOUT,
        columns: 3,
        left: ['open'],
        middle: ['runs', 'merged'],
        right: ['issues'],
        lines: [25, 70],
      },
    );
  });

  test('`cols=3` alone splits the blocks as the settings would', () => {
    assert.deepStrictEqual(
      layoutFromSearch('?cols=3'),
      withColumns(DEFAULT_LAYOUT, 3),
    );
  });

  test('two columns put what `middle` says at the top of the right one', () => {
    assert.deepStrictEqual(
      layoutFromSearch('?cols=2&left=open&middle=runs&right=merged.issues'),
      {
        ...DEFAULT_LAYOUT,
        columns: 2,
        left: ['open'],
        right: ['runs', 'merged', 'issues'],
      },
    );
  });

  test('puts the lines in order and leaves each of three columns its least width', () => {
    assert.deepStrictEqual(
      layoutFromSearch('?cols=3&lines=70-25').lines,
      [25, 70],
    );

    assert.deepStrictEqual(
      layoutFromSearch('?cols=3&lines=2-5').lines,
      [15, 30],
    );

    assert.deepStrictEqual(
      layoutFromSearch('?cols=3&lines=50-52').lines,
      [50, 65],
    );

    assert.deepStrictEqual(
      layoutFromSearch('?cols=3&lines=40').lines,
      DEFAULT_LAYOUT.lines,
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
      middle: [],
      right: ['issues', 'open'],
      split: 42,
      lines: [30, 60],
      heights: { issues: 300, open: 640 },
      mode: 'fill',
      shares: { merged: 60, open: 140.5 },
    } as const;

    assert.deepStrictEqual(
      layoutFromSearch(searchWithLayout('?theme=light', layout)),
      layout,
    );

    const three: Layout = {
      ...layout,
      columns: 3,
      left: ['merged'],
      middle: ['runs', 'open'],
      right: ['issues'],
    } as const;

    assert.deepStrictEqual(
      layoutFromSearch(searchWithLayout('', three)),
      three,
    );
  });

  test('writes three columns and the lines between them', () => {
    assert.strictEqual(
      searchWithLayout('', withLineAt(withColumns(DEFAULT_LAYOUT, 3), 0, 25)),
      '?cols=3&left=open&middle=runs.merged&right=issues&lines=25-67',
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

  test('splits one column into three, the first block on the left and the last on the right', () => {
    assert.deepStrictEqual(withColumns(DEFAULT_LAYOUT, 3), {
      ...DEFAULT_LAYOUT,
      columns: 3,
      left: ['open'],
      middle: ['runs', 'merged'],
      right: ['issues'],
    });
  });

  test('two into three keeps the left column and splits the last block off the right', () => {
    assert.deepStrictEqual(withColumns(withColumns(DEFAULT_LAYOUT, 2), 3), {
      ...DEFAULT_LAYOUT,
      columns: 3,
      left: ['open'],
      middle: ['runs', 'merged'],
      right: ['issues'],
    });
  });

  test('three into two puts the middle column at the top of the right one', () => {
    const three: Layout = {
      ...DEFAULT_LAYOUT,
      columns: 3,
      left: ['issues'],
      middle: ['merged'],
      right: ['open', 'runs'],
    } as const;

    assert.deepStrictEqual(withColumns(three, 2), {
      ...DEFAULT_LAYOUT,
      columns: 2,
      left: ['issues'],
      right: ['merged', 'open', 'runs'],
    });

    assert.deepStrictEqual(withColumns(three, 1), {
      ...DEFAULT_LAYOUT,
      left: ['issues', 'merged', 'open', 'runs'],
    });

    assert.deepStrictEqual(withColumns(three, 3), three);
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

  test('moves into the middle column, and two columns have no middle', () => {
    const three = withColumns(DEFAULT_LAYOUT, 3);

    const moved = moveBlock(three, 'issues', { column: 1, index: 0 });

    assert.deepStrictEqual(
      [moved.left, moved.middle, moved.right],
      [['open'], ['issues', 'runs', 'merged'], []],
    );

    const two = withColumns(DEFAULT_LAYOUT, 2);

    assert.deepStrictEqual(
      moveBlock(two, 'open', { column: 2, index: 0 }).right,
      ['open', 'runs', 'merged', 'issues'],
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

describe(withLineAt, () => {
  const three = withColumns(DEFAULT_LAYOUT, 3);

  test('moves one line of three columns and leaves the other where it was', () => {
    assert.deepStrictEqual(withLineAt(three, 0, 40.4).lines, [40, 67]);

    assert.deepStrictEqual(withLineAt(three, 1, 80).lines, [33, 80]);
  });

  test('leaves each of three columns its least width', () => {
    assert.deepStrictEqual(withLineAt(three, 0, 90).lines, [52, 67]);

    assert.deepStrictEqual(withLineAt(three, 0, 0).lines, [15, 67]);

    assert.deepStrictEqual(withLineAt(three, 1, 10).lines, [33, 48]);

    assert.deepStrictEqual(withLineAt(three, 1, 100).lines, [33, 85]);
  });

  test('with two columns, is the split', () => {
    const two = withColumns(DEFAULT_LAYOUT, 2);

    assert.deepStrictEqual(withLineAt(two, 0, 30), withSplit(two, 30));
  });
});

describe(withEvenLine, () => {
  test('evens the two columns beside the line, and leaves the third as it was', () => {
    const three = withLineAt(
      withLineAt(withColumns(DEFAULT_LAYOUT, 3), 1, 80),
      0,
      20,
    );

    assert.deepStrictEqual(withEvenLine(three, 0).lines, [40, 80]);

    assert.deepStrictEqual(withEvenLine(three, 1).lines, [20, 60]);
  });

  test('with two columns, evens the split', () => {
    const two = withSplit(withColumns(DEFAULT_LAYOUT, 2), 30);

    assert.strictEqual(withEvenLine(two, 0).split, 50);
  });
});

describe(columnsOf, () => {
  test('is the blocks of each column drawn, left to right', () => {
    assert.deepStrictEqual(columnsOf(DEFAULT_LAYOUT), [DEFAULT_LAYOUT.left]);

    assert.deepStrictEqual(columnsOf(withColumns(DEFAULT_LAYOUT, 2)), [
      ['open'],
      ['runs', 'merged', 'issues'],
    ]);

    assert.deepStrictEqual(columnsOf(withColumns(DEFAULT_LAYOUT, 3)), [
      ['open'],
      ['runs', 'merged'],
      ['issues'],
    ]);
  });
});

describe(columnWidths, () => {
  test('is the width of each column drawn, in percent', () => {
    assert.deepStrictEqual(columnWidths(DEFAULT_LAYOUT), [100]);

    assert.deepStrictEqual(
      columnWidths(withSplit(withColumns(DEFAULT_LAYOUT, 2), 40)),
      [40, 60],
    );

    assert.deepStrictEqual(
      columnWidths(withLineAt(withColumns(DEFAULT_LAYOUT, 3), 0, 25)),
      [25, 42, 33],
    );
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
