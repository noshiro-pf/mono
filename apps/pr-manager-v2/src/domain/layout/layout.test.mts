import { searchOf } from '../url/index.mjs';
import { layoutCodec } from './layout-codec.mjs';
import {
  canStep,
  canTab,
  DEFAULT_LAYOUT,
  drawnColumns,
  lineRange,
  moveAcross,
  normalized,
  shareOf,
  sharePercents,
  stepBlock,
  withBoundaryMoved,
  withColumnCount,
  withEvenLine,
  withHeight,
  withHidden,
  withLineAt,
  withSelectedTab,
  withShare,
  withTabbed,
  type Layout,
} from './layout.mjs';

const read = (search: string): Layout =>
  layoutCodec.read(new URLSearchParams(search));

const written = (layout: Layout): string => {
  const params = new URLSearchParams();

  layoutCodec.write(layout, params);

  return searchOf(params);
};

const spelled = (layout: Layout): string =>
  layout.columns
    .map((column) => column.map((group) => group.join('_')).join('.'))
    .join(' | ');

describe('layoutCodec', () => {
  test('keeps a height and a share only for a group’s head, and not at the default', () => {
    const layout = read(
      '?left=open.runs_queue&h.runs=300&h.queue=100&s.queue=70&s.open=100&s.runs=60',
    );

    assert.deepStrictEqual(layout.heights, { runs: 300 });

    assert.deepStrictEqual(layout.shares, { runs: 60 });
  });

  test('reads nothing as the default and writes it as nothing', () => {
    assert.deepStrictEqual(read(''), DEFAULT_LAYOUT);

    assert.strictEqual(written(DEFAULT_LAYOUT), '');
  });

  test('reads what v1 wrote', () => {
    const layout = read(
      '?cols=3&left=open_queue.runs&middle=merged&right=issues&tab=queue&lines=25-70&h.open=480&mode=fill&s.issues=150&hide=runs',
    );

    assert.strictEqual(spelled(layout), 'open_queue.runs | merged | issues');

    assert.deepStrictEqual(layout.selected, ['queue']);

    assert.deepStrictEqual(layout.lines, [25, 70]);

    assert.deepStrictEqual(layout.heights, { open: 480 });

    assert.deepStrictEqual(layout.shares, { issues: 150 });

    assert.strictEqual(layout.mode, 'fill');

    assert.deepStrictEqual(layout.hidden, ['runs']);
  });

  test('round-trips', () => {
    const search =
      '?cols=2&left=open_queue.runs&right=merged.issues&split=40&h.open=480&hide=runs&tab=queue';

    assert.strictEqual(written(read(search)), search);
  });

  test('puts a missing queue under the merge order, and others at the end of the left', () => {
    assert.strictEqual(
      spelled(read('?cols=2&left=open&right=issues')),
      'open.queue.runs.merged | issues',
    );
  });

  test('puts a missing queue into the merge order’s group when tabs follow it', () => {
    assert.strictEqual(
      spelled(read('?left=open_runs.merged.issues')),
      'open_queue_runs.merged.issues',
    );
  });

  test('drops unknown and repeated blocks', () => {
    assert.strictEqual(
      spelled(read('?left=issues.zzz.issues.open.queue.runs.merged')),
      'issues.open.queue.runs.merged',
    );
  });

  test('splits the blocks for cols alone', () => {
    assert.strictEqual(
      spelled(read('?cols=2')),
      'open.queue | runs.merged.issues',
    );

    assert.strictEqual(
      spelled(read('?cols=3')),
      'open.queue | runs.merged | issues',
    );
  });

  test('clamps numbers', () => {
    const layout = read(
      '?cols=2&left=open&right=issues&split=99&h.open=5&s.open=99999',
    );

    assert.strictEqual(layout.split, 80);

    assert.deepStrictEqual(layout.heights, { open: 120 });

    assert.deepStrictEqual(layout.shares, { open: 1000 });
  });

  test('keeps each third column at least 15% wide', () => {
    assert.deepStrictEqual(read('?cols=3&lines=5-6').lines, [15, 30]);
  });
});

describe(withColumnCount, () => {
  test('3 → 2 joins the middle to the right, 2 → 3 takes the last group out', () => {
    const three = withColumnCount(DEFAULT_LAYOUT, 3);

    const two = withColumnCount(three, 2);

    assert.strictEqual(spelled(two), 'open.queue | runs.merged.issues');

    assert.strictEqual(spelled(withColumnCount(two, 3)), spelled(three));

    assert.strictEqual(
      spelled(withColumnCount(two, 1)),
      spelled(DEFAULT_LAYOUT),
    );
  });
});

describe(stepBlock, () => {
  test('swaps a block with the group next to it', () => {
    const tabbed = read('?left=open.queue_runs.merged.issues');

    assert.strictEqual(
      spelled(stepBlock(tabbed, 'open', 'down')),
      'queue_runs.open.merged.issues',
    );
  });

  test('moves within a group, handing the head’s sizes on', () => {
    const tabbed = withHeight(
      read('?left=open.queue_runs.merged.issues'),
      'queue',
      300,
    );

    const stepped = stepBlock(tabbed, 'queue', 'down');

    assert.strictEqual(spelled(stepped), 'open.runs_queue.merged.issues');

    assert.deepStrictEqual(stepped.heights, { runs: 300 });
  });

  test('keeps the group’s weight when the queue becomes or stops being its head', () => {
    const tabbed = read('?left=queue_runs.open.merged.issues&mode=fill');

    assert.strictEqual(shareOf(tabbed, 'queue'), 50);

    const stepped = stepBlock(tabbed, 'queue', 'down');

    assert.strictEqual(spelled(stepped), 'runs_queue.open.merged.issues');

    assert.strictEqual(shareOf(stepped, 'runs'), 50);

    // Apart again, the queue has its own default, with nothing stored for it.
    const apart = stepBlock(stepped, 'queue', 'down');

    assert.strictEqual(spelled(apart), 'runs.queue.open.merged.issues');

    assert.deepStrictEqual(apart.shares, { runs: 50 });

    assert.strictEqual(shareOf(stepBlock(stepped, 'queue', 'up'), 'queue'), 50);
  });

  test('hands the head’s sizes on and keeps none for the old head', () => {
    // A height stored for a tab, as an older URL can carry, is stale.
    const sized = read(
      '?left=open.runs_queue.merged.issues&h.runs=300&h.queue=100',
    );

    const there = stepBlock(sized, 'queue', 'up');

    assert.deepStrictEqual(there.heights, { queue: 300 });

    assert.deepStrictEqual(stepBlock(there, 'queue', 'down').heights, {
      runs: 300,
    });
  });

  test('leaves a group at its edge', () => {
    const tabbed = read('?left=open.queue_runs.merged.issues');

    assert.strictEqual(
      spelled(stepBlock(tabbed, 'runs', 'down')),
      'open.queue.runs.merged.issues',
    );

    assert.strictEqual(
      spelled(stepBlock(tabbed, 'queue', 'up')),
      'open.queue.runs.merged.issues',
    );
  });

  test('cannot step past the ends', () => {
    assert.isFalse(canStep(DEFAULT_LAYOUT, 'open', 'up'));

    assert.isFalse(canStep(DEFAULT_LAYOUT, 'issues', 'down'));

    assert.isTrue(canStep(DEFAULT_LAYOUT, 'runs', 'up'));
  });
});

describe(moveAcross, () => {
  test('moves a block to the end of the next column', () => {
    const two = withColumnCount(DEFAULT_LAYOUT, 2);

    assert.strictEqual(
      spelled(moveAcross(two, 'queue', 'right')),
      'open | runs.merged.issues.queue',
    );
  });
});

describe(withTabbed, () => {
  test('joins the group above, and splits again', () => {
    assert.isTrue(canTab(DEFAULT_LAYOUT, 'runs'));

    const tabbed = withTabbed(DEFAULT_LAYOUT, 'runs', true);

    assert.strictEqual(spelled(tabbed), 'open.queue_runs.merged.issues');

    assert.strictEqual(
      spelled(withTabbed(tabbed, 'runs', false)),
      spelled(DEFAULT_LAYOUT),
    );
  });

  test('forgets the sizes of a head that joins, so it comes back at its default', () => {
    const sized = withShare(
      withHeight(read('?left=open.queue.runs.merged.issues'), 'runs', 300),
      'runs',
      30,
    );

    const joined = withTabbed(sized, 'runs', true, []);

    assert.deepStrictEqual(joined.heights, {});

    assert.deepStrictEqual(joined.shares, {});
  });

  test('joins past groups with nothing drawn', () => {
    const tabbed = withTabbed(DEFAULT_LAYOUT, 'runs', true, ['queue']);

    assert.strictEqual(spelled(tabbed), 'open_queue_runs.merged.issues');
  });
});

describe(withSelectedTab, () => {
  test('keeps one non-head tab per group', () => {
    const tabbed = withTabbed(DEFAULT_LAYOUT, 'runs', true);

    assert.deepStrictEqual(withSelectedTab(tabbed, 'runs').selected, ['runs']);

    assert.deepStrictEqual(
      withSelectedTab(withSelectedTab(tabbed, 'runs'), 'queue').selected,
      [],
    );
  });
});

describe(drawnColumns, () => {
  test('leaves out hidden and absent blocks, and keeps an empty column', () => {
    const layout = withHidden(
      read('?cols=2&left=open_queue.runs&right=merged.issues'),
      'merged',
      true,
    );

    const drawn = drawnColumns(layout, ['queue']);

    assert.deepStrictEqual(
      drawn.map((column) => column.map((group) => group.tabs)),
      [[['open'], ['runs']], [['issues']]],
    );
  });

  test('shows the head when the selected tab is hidden', () => {
    const layout = withHidden(
      withSelectedTab(read('?left=open_queue.runs.merged.issues'), 'queue'),
      'queue',
      true,
    );

    assert.strictEqual(drawnColumns(layout, [])[0]?.[0]?.shown, 'open');
  });
});

describe(withBoundaryMoved, () => {
  test('moves weight in proportion and keeps a minimum', () => {
    const start = {
      upper: 'open',
      lower: 'runs',
      upperHeight: 400,
      lowerHeight: 400,
      upperShare: 100,
      lowerShare: 100,
    } as const;

    assert.deepStrictEqual(
      withBoundaryMoved(DEFAULT_LAYOUT, start, 200).shares,
      { open: 150, runs: 50 },
    );

    assert.deepStrictEqual(
      withBoundaryMoved(DEFAULT_LAYOUT, start, 1000).shares,
      { open: 180, runs: 20 },
    );
  });

  test('keeps the dragged ratio when the shares are at their least', () => {
    const moved = withBoundaryMoved(
      DEFAULT_LAYOUT,
      {
        upper: 'open',
        lower: 'runs',
        upperHeight: 500,
        lowerHeight: 500,
        upperShare: 10,
        lowerShare: 10,
      },
      -420,
    );

    // 80px of 1000: 8%, which 10 and 10 cannot say.
    assert.deepStrictEqual(
      [shareOf(moved, 'open'), shareOf(moved, 'runs')],
      [10, 115],
    );
  });

  test('keeps the dragged ratio when the shares are near their most', () => {
    const moved = withBoundaryMoved(
      DEFAULT_LAYOUT,
      {
        upper: 'open',
        lower: 'runs',
        upperHeight: 500,
        lowerHeight: 500,
        upperShare: 900,
        lowerShare: 900,
      },
      200,
    );

    // 70%: 1260 and 540 would clamp to 1000; 1428 keeps 7:3 under it.
    assert.deepStrictEqual(
      [shareOf(moved, 'open'), shareOf(moved, 'runs')],
      [1000, 428],
    );
  });

  test('stops at the most extreme ratio two shares can make', () => {
    const moved = withBoundaryMoved(
      DEFAULT_LAYOUT,
      {
        upper: 'open',
        lower: 'runs',
        upperHeight: 4500,
        lowerHeight: 4500,
        upperShare: 100,
        lowerShare: 100,
      },
      -5000,
    );

    // 80px of 9000 is under 10:1000, which is as far as the line goes.
    assert.deepStrictEqual(
      [shareOf(moved, 'open'), shareOf(moved, 'runs')],
      [10, 1000],
    );
  });
});

test(sharePercents, () => {
  const groups =
    drawnColumns(withShare(DEFAULT_LAYOUT, 'open', 200), [])[0] ?? [];

  assert.deepStrictEqual(sharePercents(groups), [36, 9, 18, 18, 18]);
});

describe(withLineAt, () => {
  test('keeps every third at least 15% wide, and evens a line', () => {
    const three = withColumnCount(DEFAULT_LAYOUT, 3);

    assert.deepStrictEqual(withLineAt(three, 0, 60).lines, [52, 67]);

    assert.deepStrictEqual(
      withEvenLine(withLineAt(three, 0, 10), 0).lines,
      [34, 67],
    );
  });
});

describe(lineRange, () => {
  test('is what withLineAt leaves a line, with two columns or three', () => {
    assert.deepStrictEqual(lineRange(withColumnCount(DEFAULT_LAYOUT, 2), 0), {
      min: 20,
      max: 80,
    });

    const three = withColumnCount(DEFAULT_LAYOUT, 3);

    assert.deepStrictEqual(lineRange(three, 0), { min: 15, max: 52 });

    assert.deepStrictEqual(lineRange(three, 1), {
      min: three.lines[0] + 15,
      max: 85,
    });

    assert.strictEqual(withLineAt(three, 0, 99).lines[0], 52);
  });
});

test('normalized is idempotent', () => {
  const layout = read(
    '?cols=3&left=open_queue.runs&middle=merged&right=issues&tab=queue',
  );

  assert.deepStrictEqual(normalized(layout), layout);
});
