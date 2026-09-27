import {
  DEFAULT_LAYOUT,
  dropIndex,
  layoutFromSearch,
  moveBlock,
  nearestDropTarget,
  searchWithLayout,
  splitAt,
  withColumns,
  withHeight,
  withSplit,
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
        '?cols=2&left=issues&right=open.merged&split=35&h.open=480',
      ),
      {
        columns: 2,
        left: ['issues'],
        right: ['open', 'merged'],
        split: 35,
        heights: { open: 480 },
      },
    );
  });

  test('drops unknown and repeated blocks, and puts back the missing ones', () => {
    assert.deepStrictEqual(layoutFromSearch('?left=merged.bogus.merged').left, [
      'merged',
      'open',
      'issues',
    ]);
  });

  test('one column holds every block, whatever `right` says', () => {
    assert.deepStrictEqual(layoutFromSearch('?left=issues&right=open'), {
      ...DEFAULT_LAYOUT,
      left: ['issues', 'open', 'merged'],
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
      searchWithLayout('?cols=2&left=open&right=merged.issues', DEFAULT_LAYOUT),
      '',
    );
  });

  test('keeps the other parameters', () => {
    assert.strictEqual(
      searchWithLayout(
        '?theme=dark',
        withSplit(withColumns(DEFAULT_LAYOUT, 2), 60),
      ),
      '?theme=dark&cols=2&left=open&right=merged.issues&split=60',
    );
  });

  test('reads back what it wrote', () => {
    const layout: Layout = {
      columns: 2,
      left: ['merged'],
      right: ['issues', 'open'],
      split: 42,
      heights: { issues: 300, open: 640 },
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
      right: ['merged', 'issues'],
    });
  });

  test('keeps the columns it had when both already hold something', () => {
    const two: Layout = {
      ...DEFAULT_LAYOUT,
      columns: 2,
      left: ['open', 'issues'],
      right: ['merged'],
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
          right: ['open', 'merged'],
        },
        1,
      ),
      { ...DEFAULT_LAYOUT, left: ['issues', 'open', 'merged'] },
    );
  });
});

describe(moveBlock, () => {
  test('moves within a column', () => {
    assert.deepStrictEqual(
      moveBlock(DEFAULT_LAYOUT, 'issues', { column: 0, index: 0 }).left,
      ['issues', 'open', 'merged'],
    );

    assert.deepStrictEqual(
      moveBlock(DEFAULT_LAYOUT, 'open', { column: 0, index: 2 }).left,
      ['merged', 'issues', 'open'],
    );
  });

  test('moves across columns', () => {
    const two = withColumns(DEFAULT_LAYOUT, 2);

    const moved = moveBlock(two, 'issues', { column: 0, index: 1 });

    assert.deepStrictEqual(
      [moved.left, moved.right],
      [['open', 'issues'], ['merged']],
    );
  });

  test('an index past the end is the end, and one column has only a left', () => {
    assert.deepStrictEqual(
      moveBlock(DEFAULT_LAYOUT, 'open', { column: 1, index: 9 }),
      { ...DEFAULT_LAYOUT, left: ['merged', 'issues', 'open'] },
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

describe(withSplit, () => {
  test('rounds and clamps', () => {
    assert.strictEqual(withSplit(DEFAULT_LAYOUT, 33.3).split, 33);

    assert.strictEqual(withSplit(DEFAULT_LAYOUT, 5).split, 20);

    assert.strictEqual(withSplit(DEFAULT_LAYOUT, 95).split, 80);
  });
});

describe(dropIndex, () => {
  test('counts the blocks whose middle is above the pointer', () => {
    assert.strictEqual(dropIndex([100, 300, 500], 50), 0);

    assert.strictEqual(dropIndex([100, 300, 500], 200), 1);

    assert.strictEqual(dropIndex([100, 300, 500], 900), 3);

    assert.strictEqual(dropIndex([], 900), 0);
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

describe(nearestDropTarget, () => {
  const left = {
    column: 0,
    left: 0,
    right: 400,
    top: 0,
    bottom: 1000,
    midpoints: [100, 500],
  } as const;

  const right = {
    column: 1,
    left: 420,
    right: 800,
    top: 0,
    bottom: 600,
    midpoints: [300],
  } as const;

  test('is in the column under the pointer, after the blocks above it', () => {
    assert.deepStrictEqual(nearestDropTarget([left, right], 200, 300), {
      column: 0,
      index: 1,
    });

    assert.deepStrictEqual(nearestDropTarget([left, right], 600, 50), {
      column: 1,
      index: 0,
    });
  });

  test('is in the nearest column when the pointer is beside or below them', () => {
    assert.deepStrictEqual(nearestDropTarget([left, right], 900, 700), {
      column: 1,
      index: 1,
    });

    // Stacked, as on a narrow screen: the same sideways, apart downwards.
    assert.deepStrictEqual(
      nearestDropTarget(
        [
          left,
          {
            ...right,
            left: 0,
            right: 400,
            top: 1020,
            bottom: 1600,
            midpoints: [1400],
          },
        ],
        200,
        1300,
      ),
      { column: 1, index: 0 },
    );
  });

  test('is nothing without columns', () => {
    assert.isUndefined(nearestDropTarget([], 0, 0));
  });
});
