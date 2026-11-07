import { Arr } from 'ts-data-forge';
import {
  absentBlocks,
  BLOCK_IDS,
  canStep,
  columnsOf,
  columnWidths,
  DEFAULT_LAYOUT,
  DEFAULT_SHARE,
  layoutFromSearch,
  moveBlock,
  panesOf,
  searchWithLayout,
  selectedTabOf,
  sharePercents,
  shownOf,
  shownPanesOf,
  splitAt,
  stepBlock,
  withBoundaryAt,
  withColumns,
  withEvenLine,
  withEvenShares,
  withHeight,
  withHidden,
  withLineAt,
  withMode,
  withSelectedTab,
  withShare,
  withSplit,
  withTabbed,
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
        right: ['open', 'queue', 'runs', 'merged'],
        split: 35,
        lines: DEFAULT_LAYOUT.lines,
        heights: { open: 480 },
        mode: 'natural',
        shares: {},
        hidden: [],
        tabbed: [],
        selected: [],
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
        left: ['open', 'queue'],
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
        left: ['open', 'queue'],
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
      'queue',
      'runs',
      'issues',
    ]);
  });

  // It is a strip about the pull requests in the merge order, so a URL written
  // before it puts it under that, in whichever column it is.
  test('a URL written before the queue block puts it under the merge order', () => {
    assert.deepStrictEqual(
      layoutFromSearch(
        '?cols=3&left=issues&middle=open.runs&right=merged&lines=25-70',
      ),
      {
        ...DEFAULT_LAYOUT,
        columns: 3,
        left: ['issues'],
        middle: ['open', 'queue', 'runs'],
        right: ['merged'],
        lines: [25, 70],
      },
    );
  });

  test('a URL written before the runs block puts it at the end of the left column', () => {
    assert.deepStrictEqual(
      layoutFromSearch('?cols=2&left=open.merged&right=issues'),
      {
        ...DEFAULT_LAYOUT,
        columns: 2,
        left: ['open', 'queue', 'merged', 'runs'],
        right: ['issues'],
      },
    );
  });

  test('one column holds every block, whatever `right` says', () => {
    assert.deepStrictEqual(layoutFromSearch('?left=issues&right=open'), {
      ...DEFAULT_LAYOUT,
      left: ['issues', 'open', 'queue', 'runs', 'merged'],
    });
  });

  test('reads the hidden blocks, once each and in the usual order', () => {
    assert.deepStrictEqual(
      layoutFromSearch('?hide=issues.bogus.runs.issues').hidden,
      ['runs', 'issues'],
    );

    assert.deepStrictEqual(layoutFromSearch('?hide=').hidden, []);
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
        '?cols=2&left=open.queue&right=runs.merged.issues',
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
      '?theme=dark&cols=2&left=open.queue&right=runs.merged.issues&split=60',
    );
  });

  test('reads back what it wrote', () => {
    const layout: Layout = {
      columns: 2,
      left: ['merged', 'runs'],
      middle: [],
      right: ['issues', 'open', 'queue'],
      split: 42,
      lines: [30, 60],
      heights: { issues: 300, open: 640 },
      mode: 'fill',
      shares: { merged: 60, open: 140.5 },
      hidden: ['runs', 'issues'],
      tabbed: ['queue'],
      selected: ['queue'],
    } as const;

    assert.deepStrictEqual(
      layoutFromSearch(searchWithLayout('?theme=light', layout)),
      layout,
    );

    const three: Layout = {
      ...layout,
      columns: 3,
      left: ['merged'],
      middle: ['runs', 'open', 'queue'],
      right: ['issues'],
    } as const;

    assert.deepStrictEqual(
      layoutFromSearch(searchWithLayout('', three)),
      three,
    );
  });

  test('writes the hidden blocks, and nothing when none is', () => {
    assert.strictEqual(
      searchWithLayout(
        '?hide=open',
        withHidden(DEFAULT_LAYOUT, 'merged', true),
      ),
      '?hide=merged',
    );

    assert.strictEqual(searchWithLayout('?hide=open', DEFAULT_LAYOUT), '');
  });

  test('writes three columns and the lines between them', () => {
    assert.strictEqual(
      searchWithLayout('', withLineAt(withColumns(DEFAULT_LAYOUT, 3), 0, 25)),
      '?cols=3&left=open.queue&middle=runs.merged&right=issues&lines=25-67',
    );
  });
});

describe(withColumns, () => {
  test('splits one column into two, the first block on the left with the queue under it', () => {
    assert.deepStrictEqual(withColumns(DEFAULT_LAYOUT, 2), {
      ...DEFAULT_LAYOUT,
      columns: 2,
      left: ['open', 'queue'],
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
      left: ['open', 'queue'],
      middle: ['runs', 'merged'],
      right: ['issues'],
    });
  });

  test('two into three keeps the left column and splits the last block off the right', () => {
    assert.deepStrictEqual(withColumns(withColumns(DEFAULT_LAYOUT, 2), 3), {
      ...DEFAULT_LAYOUT,
      columns: 3,
      left: ['open', 'queue'],
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
      right: ['open', 'queue', 'runs'],
    } as const;

    assert.deepStrictEqual(withColumns(three, 2), {
      ...DEFAULT_LAYOUT,
      columns: 2,
      left: ['issues'],
      right: ['merged', 'open', 'queue', 'runs'],
    });

    assert.deepStrictEqual(withColumns(three, 1), {
      ...DEFAULT_LAYOUT,
      left: ['issues', 'merged', 'open', 'queue', 'runs'],
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
          right: ['open', 'queue', 'runs', 'merged'],
        },
        1,
      ),
      {
        ...DEFAULT_LAYOUT,
        left: ['issues', 'open', 'queue', 'runs', 'merged'],
      },
    );
  });
});

describe(moveBlock, () => {
  test('moves within a column', () => {
    assert.deepStrictEqual(
      moveBlock(DEFAULT_LAYOUT, 'issues', { column: 0, index: 0 }).left,
      ['issues', 'open', 'queue', 'runs', 'merged'],
    );

    assert.deepStrictEqual(
      moveBlock(DEFAULT_LAYOUT, 'open', { column: 0, index: 3 }).left,
      ['queue', 'runs', 'merged', 'open', 'issues'],
    );
  });

  test('moves across columns', () => {
    const two = withColumns(DEFAULT_LAYOUT, 2);

    const moved = moveBlock(two, 'issues', { column: 0, index: 1 });

    assert.deepStrictEqual(
      [moved.left, moved.right],
      [
        ['open', 'issues', 'queue'],
        ['runs', 'merged'],
      ],
    );
  });

  test('moves into the middle column, and two columns have no middle', () => {
    const three = withColumns(DEFAULT_LAYOUT, 3);

    const moved = moveBlock(three, 'issues', { column: 1, index: 0 });

    assert.deepStrictEqual(
      [moved.left, moved.middle, moved.right],
      [['open', 'queue'], ['issues', 'runs', 'merged'], []],
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
      {
        ...DEFAULT_LAYOUT,
        left: ['queue', 'runs', 'merged', 'issues', 'open'],
      },
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

    // The queue is one row of boxes, and needs a fraction of a list's height.
    assert.deepStrictEqual(
      sharePercents(DEFAULT_LAYOUT, ['open', 'queue']),
      [67, 33],
    );

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
      ['open', 'queue'],
      ['runs', 'merged', 'issues'],
    ]);

    assert.deepStrictEqual(columnsOf(withColumns(DEFAULT_LAYOUT, 3)), [
      ['open', 'queue'],
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

describe(withHidden, () => {
  test('hides a block and shows it again, in the usual order', () => {
    const hidden = withHidden(
      withHidden(DEFAULT_LAYOUT, 'issues', true),
      'open',
      true,
    );

    assert.deepStrictEqual(hidden.hidden, ['open', 'issues']);

    assert.deepStrictEqual(withHidden(hidden, 'issues', true), hidden);

    assert.deepStrictEqual(withHidden(hidden, 'open', false).hidden, [
      'issues',
    ]);
  });

  test('leaves the block its place, height and share', () => {
    const sized = withShare(
      withHeight(withColumns(DEFAULT_LAYOUT, 3), 'runs', 300),
      'runs',
      50,
    );

    const hidden = withHidden(sized, 'runs', true);

    assert.deepStrictEqual(
      [hidden.middle, hidden.heights, hidden.shares],
      [sized.middle, sized.heights, sized.shares],
    );

    assert.deepStrictEqual(withHidden(hidden, 'runs', false), sized);
  });

  test('keeps the hidden blocks across moves and column changes', () => {
    const hidden = withHidden(DEFAULT_LAYOUT, 'merged', true);

    assert.deepStrictEqual(withColumns(hidden, 3).hidden, ['merged']);

    assert.deepStrictEqual(
      moveBlock(hidden, 'merged', { column: 0, index: 0 }).hidden,
      ['merged'],
    );
  });
});

describe(shownOf, () => {
  test('is the blocks not hidden, in the order given', () => {
    const hidden = withHidden(DEFAULT_LAYOUT, 'runs', true);

    assert.deepStrictEqual(shownOf(hidden, ['issues', 'runs', 'open'], []), [
      'issues',
      'open',
    ]);

    assert.deepStrictEqual(shownOf(DEFAULT_LAYOUT, BLOCK_IDS, []), BLOCK_IDS);
  });

  test('leaves out the blocks the repository has nothing for', () => {
    assert.deepStrictEqual(
      shownOf(DEFAULT_LAYOUT, ['open', 'queue', 'runs'], ['queue']),
      ['open', 'runs'],
    );
  });
});

describe(absentBlocks, () => {
  test('is the queue where there is none', () => {
    assert.deepStrictEqual(absentBlocks({ queue: false }), ['queue']);

    assert.deepStrictEqual(absentBlocks({ queue: true }), []);
  });
});

describe('tabs', () => {
  /** One column: the merge order, then the queue and the runs as tabs. */
  const tabbed: Layout = {
    ...DEFAULT_LAYOUT,
    tabbed: ['queue', 'runs'],
  } as const;

  test('reads and writes a group of tabs and the tab shown', () => {
    const search = '?left=open.queue_runs.merged.issues&tab=runs';

    const read = layoutFromSearch(search);

    assert.deepStrictEqual(read, {
      ...DEFAULT_LAYOUT,
      tabbed: ['runs'],
      selected: ['runs'],
    });

    assert.strictEqual(searchWithLayout('', read), search);

    assert.deepStrictEqual(
      layoutFromSearch(searchWithLayout('', tabbed)),
      tabbed,
    );
  });

  test('a first block of a column, or a tab not of a group, is read as no tab', () => {
    assert.deepStrictEqual(
      layoutFromSearch(
        '?cols=2&left=open_queue&right=runs.merged_issues&tab=runs.queue',
      ),
      {
        ...layoutFromSearch('?cols=2&left=open_queue&right=runs.merged.issues'),
        tabbed: ['queue', 'issues'],
        selected: ['queue'],
      },
    );

    assert.deepStrictEqual(
      layoutFromSearch('?cols=2&left=_open.queue&right=runs.merged.issues'),
      layoutFromSearch('?cols=2&left=open.queue&right=runs.merged.issues'),
    );
  });

  test('a column is drawn as its panes, without what is not drawn', () => {
    assert.deepStrictEqual(panesOf(tabbed, tabbed.left), [
      ['open', 'queue', 'runs'],
      ['merged'],
      ['issues'],
    ]);

    const hidden = withHidden(withHidden(tabbed, 'open', true), 'merged', true);

    // A place keeps the first block of its group as its key, drawn or not.
    assert.deepStrictEqual(shownPanesOf(hidden, hidden.left, ['queue']), [
      { key: 'open', ids: ['runs'] },
      { key: 'issues', ids: ['issues'] },
    ]);
  });

  test('a group shows the tab chosen, or its first drawn', () => {
    assert.strictEqual(
      selectedTabOf(tabbed, ['open', 'queue', 'runs']),
      'open',
    );

    const chosen = withSelectedTab(tabbed, 'runs');

    assert.deepStrictEqual(chosen.selected, ['runs']);

    assert.strictEqual(
      selectedTabOf(chosen, ['open', 'queue', 'runs']),
      'runs',
    );

    assert.strictEqual(selectedTabOf(chosen, ['open', 'queue']), 'open');

    assert.deepStrictEqual(withSelectedTab(chosen, 'queue').selected, [
      'queue',
    ]);

    // The first is shown when none is chosen, so choosing it writes nothing.
    assert.deepStrictEqual(withSelectedTab(chosen, 'open').selected, []);
  });

  test('makes a block a tab of the one above, and takes it out', () => {
    assert.deepStrictEqual(withTabbed(DEFAULT_LAYOUT, 'runs', true).tabbed, [
      'runs',
    ]);

    assert.deepStrictEqual(
      withTabbed(DEFAULT_LAYOUT, 'open', true),
      DEFAULT_LAYOUT,
    );

    const split = withTabbed(withSelectedTab(tabbed, 'runs'), 'queue', false);

    assert.deepStrictEqual(panesOf(split, split.left), [
      ['open'],
      ['queue', 'runs'],
      ['merged'],
      ['issues'],
    ]);

    assert.deepStrictEqual(split.selected, ['runs']);
  });

  test('steps a tab among its tabs, and out of them at either end', () => {
    const down = stepBlock(tabbed, 'queue', 'down');

    assert.deepStrictEqual(down.left, [
      'open',
      'runs',
      'queue',
      'merged',
      'issues',
    ]);

    assert.deepStrictEqual(panesOf(down, down.left)[0], [
      'open',
      'runs',
      'queue',
    ]);

    const out = stepBlock(down, 'queue', 'down');

    assert.deepStrictEqual(panesOf(out, out.left), [
      ['open', 'runs'],
      ['queue'],
      ['merged'],
      ['issues'],
    ]);

    const above = stepBlock(tabbed, 'open', 'up');

    assert.deepStrictEqual(panesOf(above, above.left), [
      ['open'],
      ['queue', 'runs'],
      ['merged'],
      ['issues'],
    ]);
  });

  test('steps a block on its own past a whole group, and nowhere past the end', () => {
    const up = stepBlock(tabbed, 'merged', 'up');

    assert.deepStrictEqual(panesOf(up, up.left), [
      ['merged'],
      ['open', 'queue', 'runs'],
      ['issues'],
    ]);

    assert.strictEqual(stepBlock(up, 'merged', 'up'), up);

    assert.strictEqual(stepBlock(tabbed, 'issues', 'down'), tabbed);
  });

  test('a group keeps its size when its first tab changes', () => {
    const sized = withShare(withHeight(tabbed, 'open', 500), 'open', 300);

    const swapped = stepBlock(sized, 'queue', 'up');

    assert.deepStrictEqual(Arr.take(swapped.left, 3), [
      'queue',
      'open',
      'runs',
    ]);

    assert.deepStrictEqual(swapped.heights, { queue: 500 });

    assert.deepStrictEqual(swapped.shares, { queue: 300, open: 50 });

    // The first leaving the group, up or to another column, hands it the size.
    const left = stepBlock(sized, 'open', 'up');

    assert.deepStrictEqual(panesOf(left, left.left)[1], ['queue', 'runs']);

    assert.deepStrictEqual(left.heights, { queue: 500 });

    const moved = moveBlock(withColumns(sized, 2), 'open', {
      column: 1,
      index: 0,
    });

    assert.deepStrictEqual(moved.heights, { queue: 500 });
  });

  test('a group goes on showing its tab when the tabs are reordered', () => {
    const merged = layoutFromSearch('?left=open.queue.runs.merged_issues');

    const down = stepBlock(merged, 'merged', 'down');

    assert.deepStrictEqual(panesOf(down, down.left).at(-1), [
      'issues',
      'merged',
    ]);

    assert.strictEqual(selectedTabOf(down, ['issues', 'merged']), 'merged');

    // There and back again is the URL it started from.
    assert.strictEqual(
      searchWithLayout('', stepBlock(down, 'merged', 'up')),
      '?left=open.queue.runs.merged_issues',
    );
  });

  test('shares swapped back to their defaults are written as none', () => {
    const queued = layoutFromSearch('?left=open_queue.runs.merged.issues');

    const twice = stepBlock(stepBlock(queued, 'queue', 'up'), 'open', 'up');

    assert.deepStrictEqual(twice.shares, {});
  });

  test('a duplicate the URL drops takes its tab with it', () => {
    const read = layoutFromSearch('?cols=2&left=open.runs&right=merged_runs');

    assert.deepStrictEqual(read.tabbed, []);

    // Nor is a block joined to a block dropped.
    assert.deepStrictEqual(
      layoutFromSearch('?left=open.issues.open_runs.merged').tabbed,
      [],
    );

    assert.deepStrictEqual(
      layoutFromSearch('?left=open.bogus_runs').tabbed,
      [],
    );
  });

  test('a group with its first hidden goes on showing its tab', () => {
    const read = layoutFromSearch(
      '?left=open.queue.runs_merged_issues&hide=runs',
    );

    const up = stepBlock(read, 'issues', 'up');

    assert.strictEqual(selectedTabOf(up, ['issues', 'merged']), 'merged');
  });

  test('says where a block can step', () => {
    assert.isTrue(canStep(tabbed, 'open', 'up'));

    assert.isFalse(canStep(DEFAULT_LAYOUT, 'open', 'up'));

    assert.isFalse(canStep(tabbed, 'issues', 'down'));

    assert.isTrue(canStep(tabbed, 'merged', 'up'));
  });

  test('a tab of the block drawn above takes in the blocks not drawn between', () => {
    const viaAbsent = withTabbed(DEFAULT_LAYOUT, 'runs', true, ['queue']);

    assert.deepStrictEqual(panesOf(viaAbsent, viaAbsent.left)[0], [
      'open',
      'queue',
      'runs',
    ]);

    const hidden = withHidden(DEFAULT_LAYOUT, 'merged', true);

    const viaHidden = withTabbed(hidden, 'issues', true);

    assert.deepStrictEqual(panesOf(viaHidden, viaHidden.left), [
      ['open'],
      ['queue'],
      ['runs', 'merged', 'issues'],
    ]);
  });

  test('a queue the URL leaves out joins the group the merge order leads', () => {
    const read = layoutFromSearch('?left=open_runs.merged.issues');

    assert.deepStrictEqual(read.left, DEFAULT_LAYOUT.left);

    assert.deepStrictEqual(panesOf(read, read.left)[0], [
      'open',
      'queue',
      'runs',
    ]);

    // Named, it stays where the URL puts it.
    const named = layoutFromSearch('?left=open.queue_runs.merged.issues');

    assert.deepStrictEqual(panesOf(named, named.left)[0], ['open']);
  });

  test('moving a block takes it out of its group, which the next tab leads', () => {
    const moved = moveBlock(withColumns(tabbed, 2), 'open', {
      column: 1,
      index: 0,
    });

    assert.deepStrictEqual(panesOf(moved, moved.left), [['queue', 'runs']]);

    assert.deepStrictEqual(panesOf(moved, moved.right)[0], ['open']);

    const between = moveBlock(tabbed, 'issues', { column: 0, index: 2 });

    assert.deepStrictEqual(panesOf(between, between.left)[0], [
      'open',
      'queue',
      'issues',
      'runs',
    ]);
  });

  test('columns are split by panes, a group going whole', () => {
    const two = withColumns(tabbed, 2);

    assert.deepStrictEqual(two.left, ['open', 'queue', 'runs']);

    assert.deepStrictEqual(two.tabbed, ['queue', 'runs']);

    const lastGroup = withTabbed(DEFAULT_LAYOUT, 'issues', true);

    const three = withColumns(lastGroup, 3);

    assert.deepStrictEqual(three.right, ['merged', 'issues']);

    assert.deepStrictEqual(three.tabbed, ['issues']);
  });
});
