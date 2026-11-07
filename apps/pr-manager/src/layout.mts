/**
 * How the page's five blocks are laid out, and how that is kept in the URL.
 *
 * **The blocks** are the merge order (with the cycles under it), the queue
 * `unblock-prs` works through, the workflow runs still going, what merged, and
 * the open issues. They can be put in one column, two or three, in any order,
 * and the dividers between the columns move. Any of them can be hidden: a
 * hidden block keeps its place, its height and its share, so showing it again
 * puts it back where it was, and the blocks around it share out the column as
 * if it were not there.
 *
 * **Tabs**: a block can be drawn as a tab of the block above it, so that the
 * two take one place in the column and show one at a time; any number of blocks
 * one under another make one group of tabs that way. A group is drawn with the
 * height and the share of its first tab, drawn or not, which a change of its
 * first tab hands on, and remembers which of its tabs is shown. A hidden tab is left out of its group, as a hidden block is of its
 * column, and a group left with one tab is drawn as a plain block.
 *
 * **Their heights** are one of two modes. In `natural`, the page is as tall as
 * its blocks: each can be given a height, and then scrolls on its own, and
 * without one it is as tall as what it holds. In `fill`, the page is as tall as
 * the window and never scrolls; each column's height is shared out among its
 * blocks by their shares, and only a block scrolls. A share is a weight, not a
 * percentage, so that moving a block from one column to the other leaves the
 * rest of each as they were. Each mode keeps its numbers while the other is on,
 * so switching back finds them where they were.
 *
 * **Kept in the query string**, as the theme is (`theme.mts`), and for the same
 * reasons: a bookmark or a pasted link opens the same way, and nothing is added
 * to a `localStorage` every app on the origin shares. Only what differs from
 * {@link DEFAULT_LAYOUT} is written, so a page laid out the usual way has a URL
 * that says nothing about it:
 *
 * - `cols=2`, `cols=3`: two or three columns. Absent is one; alone, it
 *   splits the blocks as the settings would.
 * - `left=open.merged`, `middle=runs`, `right=issues`: the blocks in each
 *   column, top down, joined with `.`, which `URLSearchParams` does not
 *   escape. With one column only `left` is written, and only when it is not
 *   the usual order; `middle` only with three.
 * - `left=open_queue.runs`: within a column, `_` makes the blocks it joins one
 *   group of tabs, in that order; also unescaped.
 * - `tab=queue`: of each group of tabs, the one shown, when it is not the
 *   first.
 * - `split=40`: with two columns, the left one's share of the width, in
 *   percent.
 * - `lines=25-70`: with three columns, where the two lines between them are,
 *   in percent of the width from the left. Joined with `-` rather than `.`,
 *   which would read as a decimal point.
 * - `h.open=480`: a block's height, in CSS pixels.
 * - `mode=fill`: the window-filling mode. Absent is `natural`.
 * - `s.open=150`: a block's share, against {@link DEFAULT_SHARE} for the
 *   blocks without one.
 * - `hide=runs.merged`: the blocks hidden, in the usual order.
 *
 * Reading forgives: an unknown or repeated block is dropped, a missing one is
 * put back at the end of the left column, and a number out of range is clamped.
 * A URL written by an older page, or edited by hand, still opens.
 */

import { Arr, asPositiveInt, Num, Obj, Result } from 'ts-data-forge';
import type {
  FixedLengthTuple,
  NonEmptyTuple,
  ReadonlyRecord,
  StrictPick,
} from 'ts-type-forge';
import { currentSearch, rewriteSearch, searchOf } from './url.mjs';

/** Said here rather than on each member, which `fix:codemod:full` drops (#2042). */
export type BlockId = 'open' | 'queue' | 'runs' | 'merged' | 'issues';

/**
 * The usual order. The queue comes under the merge order, being a strip that
 * says which of the pull requests above goes next; the runs come next, being
 * the CI those pull requests wait for, and before what merged: what is going on
 * now before what is over.
 */
export const BLOCK_IDS = [
  'open',
  'queue',
  'runs',
  'merged',
  'issues',
] as const satisfies readonly BlockId[];

/** What each block is called in the view settings. */
export const BLOCK_NAMES = {
  open: 'Merge order',
  queue: 'Queue',
  runs: 'Running workflows',
  merged: 'Merged',
  issues: 'Open issues',
} as const satisfies ReadonlyRecord<BlockId, string>;

/**
 * What takes one place in a column: a block, or the blocks of a group of tabs,
 * in order.
 */
export type Pane = NonEmptyTuple<BlockId>;

/** A pane as drawn (`shownPanesOf`). */
export type ShownPane = Readonly<{
  /**
   * The first block of the pane, drawn or not: whose height and share it is
   * drawn with, and what tells it from the other panes.
   */
  key: BlockId;
  /** Its blocks drawn, in order. */
  ids: Pane;
}>;

/** See the top of this file. */
export type HeightMode = 'natural' | 'fill';

export type ColumnCount = 1 | 2 | 3;

/**
 * `0` is the left column, then the middle one with three, and the right one:
 * `1` with two columns, `2` with three.
 */
export type ColumnIndex = 0 | 1 | 2;

/** `0` is the line left of the middle column, `1` the one right of it. */
export type LineIndex = 0 | 1;

export type Layout = Readonly<{
  columns: ColumnCount;
  /**
   * Top down. With one column `left` is every block and the others are empty;
   * `middle` is empty but with three.
   */
  left: readonly BlockId[];
  middle: readonly BlockId[];
  right: readonly BlockId[];
  /** With two columns, the left one's share of the width, in percent. */
  split: number;
  /**
   * With three columns, where the lines between them are, in percent of the
   * width from the left; in order, and every column at least
   * {@link MIN_THIRD_WIDTH} wide. Kept apart from {@link Layout.split}, so that
   * going from two columns to three and back finds each where it was.
   */
  lines: FixedLengthTuple<2, number>;
  /**
   * In CSS pixels. A block without one is as tall as what it holds. Read in the
   * `natural` mode only.
   */
  heights: Partial<ReadonlyRecord<BlockId, number>>;
  mode: HeightMode;
  /**
   * What part of its column's height a block is given, against the others'.
   * One without is {@link defaultShareOf} it. Read in the `fill` mode only.
   */
  shares: Partial<ReadonlyRecord<BlockId, number>>;
  /**
   * The blocks not drawn, in the order of {@link BLOCK_IDS}. Each is still in
   * `left`, `middle` or `right`, which is where showing it puts it back.
   */
  hidden: readonly BlockId[];
  /**
   * The blocks drawn as a tab of the block above them in their column, in the
   * order of {@link BLOCK_IDS}; never the first of a column. See
   * {@link panesOf}.
   */
  tabbed: readonly BlockId[];
  /**
   * Of each group of tabs, the one shown, when it is not the group's first; in
   * the order of {@link BLOCK_IDS}. See {@link selectedTabOf}.
   */
  selected: readonly BlockId[];
}>;

/**
 * The line between two blocks of a column being dragged in the `fill` mode, as
 * it was when the drag started: where the pointer was, and the blocks' heights
 * as drawn and their shares.
 */
export type BoundaryDrag = Readonly<{
  upper: BlockId;
  lower: BlockId;
  fromY: number;
  upperHeight: number;
  lowerHeight: number;
  upperShare: number;
  lowerShare: number;
}>;

/** Where a block is put: a column, and a place among the blocks there. */
export type BlockPlace = Readonly<{ column: ColumnIndex; index: number }>;

export const DEFAULT_LAYOUT: Layout = {
  columns: 1,
  left: BLOCK_IDS,
  middle: [],
  right: [],
  split: 50,
  lines: [33, 67],
  heights: {},
  mode: 'natural',
  shares: {},
  hidden: [],
  tabbed: [],
  selected: [],
} as const;

export const MIN_HEIGHT = 120;

export const MAX_HEIGHT = 4000;

export const MIN_SPLIT = 20;

export const MAX_SPLIT = 80;

/** The least width a column of three is given, in percent. */
export const MIN_THIRD_WIDTH = 15;

export const DEFAULT_SHARE = 100;

/**
 * The share a block has until it is given one: {@link DEFAULT_SHARE}, but for
 * the queue, which is one row of boxes and needs a fraction of the height a
 * list does.
 */
export const defaultShareOf = (block: BlockId): number =>
  block === 'queue' ? QUEUE_SHARE : DEFAULT_SHARE;

const QUEUE_SHARE = 50;

export const MIN_SHARE = 10;

export const MAX_SHARE = 1000;

/** The least a boundary drag leaves either block, in CSS pixels. */
export const MIN_FILL_HEIGHT = 80;

export const layoutFromSearch = (search: string): Layout => {
  const params = new URLSearchParams(search);

  const columns = columnsParam(params.get(PARAM.columns));

  const split = numberParam(params.get(PARAM.split));

  const lines = linesParam(params.get(PARAM.lines));

  const heights = Object.fromEntries(
    Arr.generate(function* () {
      for (const id of BLOCK_IDS) {
        const height = numberParam(params.get(heightParam(id)));

        if (height !== undefined) {
          yield [id, clampHeight(height)] as const;
        }
      }
    }),
  );

  const shares = Object.fromEntries(
    Arr.generate(function* () {
      for (const id of BLOCK_IDS) {
        const share = numberParam(params.get(shareParam(id)));

        if (share !== undefined) {
          yield [id, clampShare(share)] as const;
        }
      }
    }),
  );

  const parsed: Layout = {
    ...arrange(
      columns,
      blockList(params.get(PARAM.left)),
      blockList(params.get(PARAM.middle)),
      blockList(params.get(PARAM.right)),
    ),
    split: split === undefined ? DEFAULT_LAYOUT.split : clampSplit(split),
    lines: lines === undefined ? DEFAULT_LAYOUT.lines : clampLines(lines),
    heights,
    mode:
      params.get(PARAM.mode) === 'fill'
        ? ('fill' as const)
        : ('natural' as const),
    shares,
    hidden: inUsualOrder(blockList(params.get(PARAM.hidden))),
    tabbed: tabbedList(
      [PARAM.left, PARAM.middle, PARAM.right].map((param) => params.get(param)),
    ),
    selected: blockList(params.get(PARAM.selected)),
  } as const;

  const read = [PARAM.left, PARAM.middle, PARAM.right].some((param) =>
    blockList(params.get(param)).includes('queue'),
  )
    ? parsed
    : queueInGroup(parsed);

  // `?cols=2` or `?cols=3` alone, as typed by hand, splits the columns the way
  // the settings would rather than leaving the others empty.
  return columns !== 1 &&
    !params.has(PARAM.left) &&
    !params.has(PARAM.middle) &&
    !params.has(PARAM.right)
    ? withColumns({ ...read, columns: 1 }, columns)
    : normalized(read);
};

/** The query string with the layout written into it, the rest as it was. */
export const searchWithLayout = (search: string, layout: Layout): string => {
  const params = new URLSearchParams(search);

  for (const param of [
    PARAM.columns,
    PARAM.left,
    PARAM.middle,
    PARAM.right,
    PARAM.split,
    PARAM.lines,
    PARAM.mode,
    PARAM.hidden,
    PARAM.selected,
    ...BLOCK_IDS.map(heightParam),
    ...BLOCK_IDS.map(shareParam),
  ]) {
    params.delete(param);
  }

  const written = (ids: readonly BlockId[]): string =>
    panesOf(layout, ids)
      .map((pane) => pane.join(TAB_SEPARATOR))
      .join(SEPARATOR);

  if (layout.columns === 1) {
    if (
      !Arr.eq(layout.left, DEFAULT_LAYOUT.left) ||
      Arr.isNonEmpty(layout.tabbed)
    ) {
      params.set(PARAM.left, written(layout.left));
    }
  } else {
    params.set(PARAM.columns, layout.columns.toString());

    params.set(PARAM.left, written(layout.left));

    if (layout.columns === 3) {
      params.set(PARAM.middle, written(layout.middle));
    }

    params.set(PARAM.right, written(layout.right));
  }

  if (layout.split !== DEFAULT_LAYOUT.split) {
    params.set(PARAM.split, layout.split.toString());
  }

  if (!Arr.eq(layout.lines, DEFAULT_LAYOUT.lines)) {
    params.set(PARAM.lines, layout.lines.join(LINE_SEPARATOR));
  }

  for (const id of BLOCK_IDS) {
    const height = layout.heights[id];

    if (height !== undefined) {
      params.set(heightParam(id), height.toString());
    }
  }

  if (layout.mode !== DEFAULT_LAYOUT.mode) {
    params.set(PARAM.mode, layout.mode);
  }

  for (const id of BLOCK_IDS) {
    const share = layout.shares[id];

    if (share !== undefined) {
      params.set(shareParam(id), share.toString());
    }
  }

  if (Arr.isNonEmpty(layout.hidden)) {
    params.set(PARAM.hidden, layout.hidden.join(SEPARATOR));
  }

  if (Arr.isNonEmpty(layout.selected)) {
    params.set(PARAM.selected, layout.selected.join(SEPARATOR));
  }

  return searchOf(params);
};

/** What the query string asks for, now. */
export const layoutFromLocation = (): Layout =>
  layoutFromSearch(currentSearch());

/** Writes the layout into the address bar; see `rewriteSearch`. */
export const saveLayout = (layout: Layout): void => {
  rewriteSearch((search) => searchWithLayout(search, layout));
};

/**
 * Two columns from one put the first block on the left and the rest on the
 * right, which is the split that leaves the merge order the most room — the
 * queue staying under it when it follows it, since it is a strip about the pull
 * requests above; three from one put the last block on the right as well, and
 * the rest between.
 * Columns that already hold something are kept: three from two keep the left
 * column and split the right one's last block off it, and two from three put
 * the middle column at the top of the right one. Fewer from more otherwise keep
 * the order left to right, and the same number is left as it is. A group of
 * tabs is split off as a whole, as one block is.
 */
export const withColumns = (layout: Layout, columns: ColumnCount): Layout =>
  normalized(withColumnsAsGiven(layout, columns));

/** The blocks of each column drawn, left to right. */
export const columnsOf = (layout: Layout): readonly (readonly BlockId[])[] => {
  switch (layout.columns) {
    case 1:
      return [layout.left];

    case 2:
      return [layout.left, layout.right];

    case 3:
      return [layout.left, layout.middle, layout.right];
  }
};

/**
 * Of `ids`, the blocks drawn: those {@link Layout.hidden} does not name, and
 * that the repository has something for — `absent` names those it does not,
 * which are not hidden so much as empty, and come back as they were on a
 * repository that has them.
 */
export const shownOf = (
  layout: Layout,
  ids: readonly BlockId[],
  absent: readonly BlockId[],
): readonly BlockId[] =>
  ids.filter((id) => !layout.hidden.includes(id) && !absent.includes(id));

/** The blocks a repository without some of what this one runs has nothing for. */
export const absentBlocks = (
  features: Readonly<{ queue: boolean }>,
): readonly BlockId[] =>
  features.queue ? ([] as const) : (['queue'] as const);

/**
 * The blocks of a column, `ids`, top down, as they are drawn: each group of
 * tabs one pane, and each block on its own another.
 */
export const panesOf = (
  layout: Readonly<{ tabbed: readonly BlockId[] }>,
  ids: readonly BlockId[],
): readonly (readonly BlockId[])[] => {
  const starts = Arr.generate(function* () {
    for (const [index, id] of ids.entries()) {
      if (index === 0 || !layout.tabbed.includes(id)) {
        yield index;
      }
    }
  });

  return starts.map((start, index) => ids.slice(start, starts[index + 1]));
};

/**
 * {@link panesOf} the blocks drawn: each pane without what {@link shownOf}
 * leaves out, and a pane left with nothing left out too.
 */
export const shownPanesOf = (
  layout: Layout,
  ids: readonly BlockId[],
  absent: readonly BlockId[],
): readonly ShownPane[] =>
  Arr.generate(function* () {
    for (const pane of panesOf(layout, ids)) {
      const [key] = pane;

      const shown = shownOf(layout, pane, absent);

      if (key !== undefined && Arr.isNonEmpty(shown)) {
        yield { key, ids: shown } as const;
      }
    }
  });

/** The pane `block` is in, all its blocks drawn or not. */
export const paneOf = (layout: Layout, block: BlockId): readonly BlockId[] =>
  columnsOf(layout)
    .flatMap((ids) => panesOf(layout, ids))
    .find((pane) => pane.includes(block)) ?? [block];

/**
 * Whether {@link stepBlock} would move `block`: everything can, but a block on
 * its own at the end of its column it would go past.
 */
export const canStep = (
  layout: Layout,
  block: BlockId,
  direction: 'up' | 'down',
): boolean => {
  const ids = columnsOf(layout).find((each) => each.includes(block)) ?? [];

  const panes = panesOf(layout, ids);

  const at = panes.findIndex((pane) => pane.includes(block));

  return (
    (panes[at]?.length ?? 0) > 1 ||
    (direction === 'up' ? at > 0 : at < panes.length - 1)
  );
};

/**
 * The tab shown of a pane, which is the blocks of a group drawn: the one chosen,
 * or the first when that is not drawn or none was.
 */
export const selectedTabOf = (
  layout: Layout,
  pane: readonly BlockId[],
): BlockId | undefined =>
  pane.find((id) => layout.selected.includes(id)) ?? pane[0];

/** Shows `block` among the tabs of its group. */
export const withSelectedTab = (layout: Layout, block: BlockId): Layout => {
  const pane = paneOf(layout, block);

  return normalized({
    ...layout,
    selected: Arr.toPushed(
      layout.selected.filter((id) => !pane.includes(id)),
      block,
    ),
  });
};

/**
 * Makes `block` a tab of the block drawn above it — the blocks not drawn
 * between them, hidden or `absent`, joining the group too, so that they come
 * back in it — or takes it out of the group it is in: then it and the tabs
 * under it make a group of their own. Nothing happens to the first block of a
 * column, which has nothing above it.
 */
export const withTabbed = (
  layout: Layout,
  block: BlockId,
  tabbed: boolean,
  absent: readonly BlockId[] = [],
): Layout => {
  if (!tabbed) {
    return normalized({
      ...layout,
      tabbed: layout.tabbed.filter((id) => id !== block),
    });
  }

  const ids = columnsOf(layout).find((each) => each.includes(block)) ?? [];

  const above = ids.slice(0, ids.indexOf(block));

  const drawn = above.findLastIndex(
    (id) => !layout.hidden.includes(id) && !absent.includes(id),
  );

  // With nothing drawn above, every block above joins.
  const joining = above.slice(Math.max(1, drawn + 1));

  return normalized({
    ...layout,
    tabbed: [...layout.tabbed, ...joining, block],
  });
};

/**
 * Moves `block` one place up or down its column, as the layout settings do: a
 * tab among the tabs of its group, and out of it past the first or the last; a
 * block on its own past the pane next to it, which may be a group of tabs. The
 * layout as it was when there is nowhere to go, so that `!==` says whether it
 * moved. A group keeps its size when its first tab changes, and the block that
 * was its first takes the size of the one that is now.
 */
export const stepBlock = (
  layout: Layout,
  block: BlockId,
  direction: 'up' | 'down',
): Layout => {
  const columns = columnsOf(layout);

  const column = columns.findIndex((ids) => ids.includes(block));

  const panes = panesOf(layout, columns[column] ?? []);

  const at = panes.findIndex((each) => each.includes(block));

  const pane = panes[at];

  if (pane === undefined) {
    return layout;
  }

  const step = direction === 'up' ? -1 : 1;

  if (pane.length > 1) {
    const index = pane.indexOf(block);

    const other = pane[index + step];

    if (other !== undefined) {
      const swapped = pane.map((id) =>
        id === block ? other : id === other ? block : id,
      );

      return withPanes(
        index === 0 || index + step === 0
          ? withSizesSwapped(layout, block, other)
          : layout,
        column,
        panes.map((each, i) => (i === at ? swapped : each)),
      );
    }

    const rest = pane.filter((id) => id !== block);

    const [next] = rest;

    return withPanes(
      index === 0 && next !== undefined
        ? withSizesSwapped(layout, block, next)
        : layout,
      column,
      [
        ...panes.slice(0, at),
        ...(direction === 'up' ? [[block], rest] : [rest, [block]]),
        ...panes.slice(at + 1),
      ],
    );
  }

  const adjacent = panes[at + step];

  return adjacent === undefined
    ? layout
    : withPanes(
        layout,
        column,
        panes.map((each, i) =>
          i === at ? adjacent : i === at + step ? pane : each,
        ),
      );
};

/**
 * Hides `block`, or shows it again where it was. Its place, height and share
 * are left as they were.
 */
export const withHidden = (
  layout: Layout,
  block: BlockId,
  hidden: boolean,
): Layout =>
  ({
    ...layout,
    hidden: inUsualOrder(
      hidden
        ? Arr.toPushed(layout.hidden, block)
        : layout.hidden.filter((id) => id !== block),
    ),
  }) as const;

/** The width of each column drawn, left to right, in percent. */
export const columnWidths = (layout: Layout): readonly number[] => {
  switch (layout.columns) {
    case 1:
      return [100];

    case 2:
      return [layout.split, 100 - layout.split];

    case 3: {
      const [first, second] = layout.lines;

      return [first, second - first, 100 - second];
    }
  }
};

/**
 * Takes `block` out of wherever it is and puts it at `target`, whose index
 * counts the blocks already there without it. A column past the last drawn is
 * the last: with one column there is only the left, and with two `1` and `2`
 * are both the right.
 *
 * It leaves its group of tabs, if it was in one, which the tab under it then
 * leads at the group's size; and it joins one only when put between two of its
 * tabs.
 */
export const moveBlock = (
  layout: Layout,
  block: BlockId,
  target: BlockPlace,
): Layout => {
  const from = columnsOf(layout).find((ids) => ids.includes(block)) ?? [];

  const under = from[from.indexOf(block) + 1];

  // The first of a group leaving it hands the group its size.
  const leads =
    under !== undefined &&
    layout.tabbed.includes(under) &&
    !layout.tabbed.includes(block);

  const resized = leads ? withSizesSwapped(layout, block, under) : layout;

  const leaving = layout.tabbed.filter(
    (id) => id !== block && (id !== under || !leads),
  );

  const without = columnsOf(layout).map((ids) =>
    ids.filter((id) => id !== block),
  );

  const column = Math.min(target.column, without.length - 1);

  const at = Math.max(0, Math.min(target.index, without[column]?.length ?? 0));

  const placed = without.map((ids, index) =>
    index === column ? [...ids.slice(0, at), block, ...ids.slice(at)] : ids,
  );

  const below = placed[column]?.[at + 1];

  return normalized({
    ...resized,
    ...placedColumns(layout.columns, placed),
    tabbed:
      below !== undefined && leaving.includes(below)
        ? Arr.toPushed(leaving, block)
        : leaving,
  });
};

/** `undefined` gives the block back its natural height. */
export const withHeight = (
  layout: Layout,
  block: BlockId,
  height: number | undefined,
): Layout => {
  const rest = Obj.filter(layout.heights, (_value, id) => id !== block);

  return {
    ...layout,
    heights:
      height === undefined ? rest : { ...rest, [block]: clampHeight(height) },
  };
};

export const withMode = (layout: Layout, mode: HeightMode): Layout =>
  ({
    ...layout,
    mode,
  }) as const;

/** `undefined` gives the block back {@link defaultShareOf} it. */
export const withShare = (
  layout: Layout,
  block: BlockId,
  share: number | undefined,
): Layout => {
  const rest = Obj.filter(layout.shares, (_value, id) => id !== block);

  return {
    ...layout,
    shares:
      share === undefined ? rest : { ...rest, [block]: clampShare(share) },
  };
};

export const shareOf = (layout: Layout, block: BlockId): number =>
  layout.shares[block] ?? defaultShareOf(block);

/**
 * Gives `blocks` the mean of their shares: the same height each, out of what
 * they had between them, which leaves the other blocks of the column as they
 * were.
 */
export const withEvenShares = (
  layout: Layout,
  blocks: readonly BlockId[],
): Layout => {
  if (!Arr.isNonEmpty(blocks)) {
    return layout;
  }

  const mean = Num.div(
    Arr.sum(blocks.map((id) => shareOf(layout, id))),
    asPositiveInt(blocks.length),
  );

  return blocks.reduce((evened, id) => withShare(evened, id, mean), layout);
};

/** What part of the column each of `blocks` is given, in whole percent. */
export const sharePercents = (
  layout: Layout,
  blocks: readonly BlockId[],
): readonly number[] => {
  const shares = blocks.map((id) => shareOf(layout, id));

  const total = Arr.sum(shares);

  return shares.map((share) =>
    Num.isNonZero(total) ? Math.round(Num.div(share, total) * 100) : 0,
  );
};

/**
 * Where a boundary drag puts the line when the pointer is at `y`: the upper
 * block as tall as it was plus how far the pointer moved, the lower one the
 * rest, neither under {@link MIN_FILL_HEIGHT}, and their shares split the same
 * way. Their total share stays what it was, so the other blocks of the column
 * keep their heights. Nothing changes for blocks not drawn.
 */
export const withBoundaryAt = (
  layout: Layout,
  drag: BoundaryDrag,
  y: number,
): Layout => {
  const totalHeight = drag.upperHeight + drag.lowerHeight;

  if (!Num.isNonZero(totalHeight)) {
    return layout;
  }

  const least = Math.min(MIN_FILL_HEIGHT, totalHeight / 2);

  const upperHeight = Math.min(
    totalHeight - least,
    Math.max(least, drag.upperHeight + y - drag.fromY),
  );

  const totalShare = drag.upperShare + drag.lowerShare;

  const upperShare = roundShare(totalShare * Num.div(upperHeight, totalHeight));

  return withShare(
    withShare(layout, drag.upper, upperShare),
    drag.lower,
    roundShare(totalShare - upperShare),
  );
};

export const withSplit = (layout: Layout, split: number): Layout =>
  ({
    ...layout,
    split: clampSplit(split),
  }) as const;

/**
 * Moves the line between two columns to `at`, in percent of the width: with two
 * columns that is the split, and with three one of the lines, the other staying
 * where it is and every column keeping {@link MIN_THIRD_WIDTH}.
 */
export const withLineAt = (
  layout: Layout,
  line: LineIndex,
  at: number,
): Layout => {
  if (layout.columns !== 3) {
    return withSplit(layout, at);
  }

  const [first, second] = layout.lines;

  return {
    ...layout,
    lines:
      line === 0
        ? [clampBetween(at, MIN_THIRD_WIDTH, second - MIN_THIRD_WIDTH), second]
        : [
            first,
            clampBetween(at, first + MIN_THIRD_WIDTH, 100 - MIN_THIRD_WIDTH),
          ],
  };
};

/**
 * Gives the two columns beside a line the same width, out of what they had
 * between them, which leaves the third of three as it was. With two columns, it
 * evens the split.
 */
export const withEvenLine = (layout: Layout, line: LineIndex): Layout => {
  if (layout.columns !== 3) {
    return withSplit(layout, DEFAULT_LAYOUT.split);
  }

  const [first, second] = layout.lines;

  return withLineAt(
    layout,
    line,
    line === 0 ? Num.div(second, 2) : Num.div(first + 100, 2),
  );
};

/**
 * The split a pointer at `x` asks for, across a layout whose box starts at
 * `left`. Unclamped; {@link withSplit} clamps. Nothing for a layout with no
 * width, which is one not drawn.
 */
export const splitAt = (
  x: number,
  box: Readonly<{ left: number; width: number }>,
): number | undefined =>
  Num.isNonZero(box.width) ? Num.div(x - box.left, box.width) * 100 : undefined;

type Columns = StrictPick<Layout, 'columns' | 'left' | 'middle' | 'right'>;

const PARAM = {
  columns: 'cols',
  left: 'left',
  middle: 'middle',
  right: 'right',
  split: 'split',
  lines: 'lines',
  mode: 'mode',
  hidden: 'hide',
  selected: 'tab',
} as const;

const SEPARATOR = '.';

/** Between the tabs of one group, within a column's list. */
const TAB_SEPARATOR = '_';

const LINE_SEPARATOR = '-';

const columnsParam = (raw: string | null): ColumnCount =>
  raw === '3' ? 3 : raw === '2' ? 2 : 1;

/** Absent, empty and not-a-number are all no number. */
const numberParam = (raw: string | null): number | undefined => {
  if (raw === null) {
    return undefined;
  }

  const parsed = Result.unwrapOkOr(Num.safeParseFloat(raw), Number.NaN);

  return Number.isFinite(parsed) ? parsed : undefined;
};

/** Two numbers, or none. */
const linesParam = (
  raw: string | null,
): FixedLengthTuple<2, number> | undefined => {
  if (raw === null) {
    return undefined;
  }

  const [first, second, ...rest] = raw.split(LINE_SEPARATOR).map(numberParam);

  return first === undefined || second === undefined || Arr.isNonEmpty(rest)
    ? undefined
    : [first, second];
};

const heightParam = (id: BlockId): string => `h.${id}` as const;

const shareParam = (id: BlockId): string => `s.${id}` as const;

const isBlockId = (value: string): value is BlockId =>
  (BLOCK_IDS as readonly string[]).includes(value);

const blockList = (raw: string | null): readonly BlockId[] =>
  raw === null
    ? ([] as const)
    : raw
        .split(SEPARATOR)
        .flatMap((piece) => piece.split(TAB_SEPARATOR))
        .filter(isBlockId);

/**
 * Of the columns' lists, the blocks joined by `_` to a block before them, each
 * where it is first mentioned only, and only to a block kept: `arrange` drops
 * unknown and repeated blocks, and with them what they were joined to.
 */
const tabbedList = (raws: readonly (string | null)[]): readonly BlockId[] => {
  const mut_seen = new Set<BlockId>();

  return Arr.generate(function* () {
    for (const raw of raws) {
      for (const piece of raw?.split(SEPARATOR) ?? []) {
        // Joined only to a block kept before it in the same piece.
        const [, ...joined] = Arr.generate(function* () {
          for (const id of piece.split(TAB_SEPARATOR)) {
            if (!isBlockId(id) || mut_seen.has(id)) {
              continue;
            }

            mut_seen.add(id);

            yield id;
          }
        });

        yield* joined;
      }
    }
  });
};

/** Each once, in the order of {@link BLOCK_IDS}, so a URL has one spelling. */
const inUsualOrder = (ids: readonly BlockId[]): readonly BlockId[] =>
  BLOCK_IDS.filter((id) => ids.includes(id));

/**
 * The tabs as a layout can have them: no first block of a column a tab, and of
 * each group the tab chosen only when it is one of the group's and not its
 * first, each once and in the usual order.
 */
const normalized = (layout: Layout): Layout => {
  const columns = columnsOf(layout);

  const firsts = new Set(columns.flatMap(Arr.take(1)));

  const tabbed = inUsualOrder(layout.tabbed.filter((id) => !firsts.has(id)));

  const selected = Arr.generate(function* () {
    for (const pane of columns.flatMap((ids) => panesOf({ tabbed }, ids))) {
      const chosen = pane.find((id) => layout.selected.includes(id));

      if (chosen !== undefined && chosen !== pane[0]) {
        yield chosen;
      }
    }
  });

  const inOrder = inUsualOrder(selected);

  // The same layout when nothing changed, so that a change that does nothing is
  // not one.
  return Arr.eq(tabbed, layout.tabbed) && Arr.eq(inOrder, layout.selected)
    ? layout
    : { ...layout, tabbed, selected: inOrder };
};

/** The columns {@link columnsOf} gave, with their blocks changed. */
const placedColumns = (
  columns: ColumnCount,
  placed: readonly (readonly BlockId[])[],
): Columns => {
  const [left = [], second = [], third = []] = placed;

  switch (columns) {
    case 1:
      return { columns, left, middle: [], right: [] };

    case 2:
      return { columns, left, middle: [], right: second };

    case 3:
      return { columns, left, middle: second, right: third };
  }
};

/** The column at `column` made of `panes`, top down. */
const withPanes = (
  layout: Layout,
  column: number,
  panes: readonly (readonly BlockId[])[],
): Layout => {
  const ids = panes.flat();

  // Each group goes on showing the tab it showed, which a change of its first
  // would otherwise change when that was the one shown.
  const shown = Arr.generate(function* () {
    for (const pane of columnsOf(layout).flatMap((each) =>
      panesOf(layout, each),
    )) {
      // Of the tabs not hidden, as the group is drawn.
      const tab = selectedTabOf(
        layout,
        pane.filter((id) => !layout.hidden.includes(id)),
      );

      if (tab !== undefined && pane.length > 1) {
        yield tab;
      }
    }
  });

  return normalized({
    ...layout,
    selected: shown,
    ...placedColumns(
      layout.columns,
      columnsOf(layout).map((each, index) => (index === column ? ids : each)),
    ),
    tabbed: [
      ...layout.tabbed.filter((id) => !ids.includes(id)),
      ...panes.flatMap(([, ...tabs]) => tabs),
    ],
  });
};

/**
 * The two blocks' heights and shares, each given the other's: what keeps a
 * group its size when its first tab changes.
 */
const withSizesSwapped = (layout: Layout, a: BlockId, b: BlockId): Layout => {
  const heightOfA = layout.heights[a];

  const heightOfB = layout.heights[b];

  const shareOfA = shareOf(layout, a);

  const shareOfB = shareOf(layout, b);

  const heightsSwapped = withHeight(
    withHeight(layout, a, heightOfB),
    b,
    heightOfA,
  );

  // A share that comes to the block's default is written as none, so that the
  // URL keeps its one spelling.
  const shareFor = (block: BlockId, share: number): number | undefined =>
    share === defaultShareOf(block) ? undefined : share;

  return shareOfA === shareOfB
    ? heightsSwapped
    : withShare(
        withShare(heightsSwapped, a, shareFor(a, shareOfB)),
        b,
        shareFor(b, shareOfA),
      );
};

const queueUnderOpen = (ids: readonly BlockId[]): readonly BlockId[] =>
  ids.flatMap((id) => (id === 'open' ? (['open', 'queue'] as const) : [id]));

/** The queue put under the merge order, or at the end of the left column. */
const withQueueUnderOpen = (placed: Columns): Columns =>
  [placed.left, placed.middle, placed.right].some((ids) => ids.includes('open'))
    ? ({
        ...placed,
        left: queueUnderOpen(placed.left),
        middle: queueUnderOpen(placed.middle),
        right: queueUnderOpen(placed.right),
      } as const)
    : ({ ...placed, left: Arr.toPushed(placed.left, 'queue') } as const);

/** {@link arrange}, with `missing` going to the end of the left column. */
const arrangeMentioned = (
  columns: ColumnCount,
  left: readonly BlockId[],
  middle: readonly BlockId[],
  right: readonly BlockId[],
  missing: readonly BlockId[],
): Columns => {
  const ordered = Arr.uniq([...left, ...middle, ...right]);

  if (columns === 1) {
    return { columns, left: [...ordered, ...missing], middle: [], right: [] };
  }

  const leftOnly = Arr.uniq(left);

  if (columns === 2) {
    return {
      columns,
      left: [...leftOnly, ...missing],
      middle: [],
      right: Arr.uniq([...middle, ...right]).filter(
        (id) => !leftOnly.includes(id),
      ),
    };
  }

  const middleOnly = Arr.uniq(middle).filter((id) => !leftOnly.includes(id));

  return {
    columns,
    left: [...leftOnly, ...missing],
    middle: middleOnly,
    right: Arr.uniq(right).filter(
      (id) => !leftOnly.includes(id) && !middleOnly.includes(id),
    ),
  };
};

/**
 * Every block exactly once: the first mention wins, and what is not mentioned
 * goes to the end of the left column — but for the queue, which goes under the
 * merge order, wherever that is, being a strip about the pull requests in it.
 * With fewer than three columns, the middle's blocks go to the top of the right
 * one, as {@link withColumns} puts them; with one, every block is on the left.
 */
const arrange = (
  columns: ColumnCount,
  left: readonly BlockId[],
  middle: readonly BlockId[],
  right: readonly BlockId[],
): Columns => {
  const mentioned = Arr.uniq([...left, ...middle, ...right]);

  const placed = arrangeMentioned(
    columns,
    left,
    middle,
    right,
    BLOCK_IDS.filter((id) => id !== 'queue' && !mentioned.includes(id)),
  );

  return mentioned.includes('queue') ? placed : withQueueUnderOpen(placed);
};

/**
 * The first pane — a block, or a group of tabs — with the queue when the two
 * are each on their own, one after the other, and the rest.
 */
const leadApart = (
  layout: Layout,
  ids: readonly BlockId[],
): FixedLengthTuple<2, readonly BlockId[]> => {
  const [first, second] = panesOf(layout, ids);

  const lead =
    first === undefined
      ? ([] as const)
      : second !== undefined &&
          Arr.eq(first, ['open']) &&
          Arr.eq(second, ['queue'])
        ? (['open', 'queue'] as const)
        : first;

  return [lead, ids.slice(lead.length)];
};

/** The blocks but the last pane, and the last pane on its own. */
const lastApart = (
  layout: Layout,
  ids: readonly BlockId[],
): FixedLengthTuple<2, readonly BlockId[]> => {
  const panes = panesOf(layout, ids);

  const last = panes.at(-1);

  return last === undefined ? [[], []] : [Arr.butLast(panes).flat(), last];
};

const withColumnsAsGiven = (layout: Layout, columns: ColumnCount): Layout => {
  const { left, middle, right } = layout;

  if (columns === 1) {
    return { ...layout, ...arrange(1, left, middle, right) };
  }

  if (Arr.isNonEmpty(left)) {
    if (layout.columns === columns) {
      return layout;
    }

    if (layout.columns === 3) {
      return { ...layout, ...arrange(2, left, [], [...middle, ...right]) };
    }

    if (layout.columns === 2) {
      return {
        ...layout,
        ...arrange(3, left, ...lastApart(layout, right)),
      };
    }
  }

  const [lead, rest] = leadApart(layout, [...left, ...middle, ...right]);

  return columns === 2
    ? { ...layout, ...arrange(2, lead, [], rest) }
    : { ...layout, ...arrange(3, lead, ...lastApart(layout, rest)) };
};

/**
 * A URL that does not name the queue has it put under the merge order
 * (`arrange`); when the merge order leads a group of tabs, the queue is one of
 * them, rather than a block splitting the group in two.
 */
const queueInGroup = (layout: Layout): Layout => {
  const ids = columnsOf(layout).find((each) => each.includes('queue')) ?? [];

  const under = ids[ids.indexOf('queue') + 1];

  return under !== undefined &&
    ids[ids.indexOf('queue') - 1] === 'open' &&
    layout.tabbed.includes(under) &&
    !layout.tabbed.includes('queue')
    ? { ...layout, tabbed: Arr.toPushed(layout.tabbed, 'queue') }
    : layout;
};

const clampHeight = (height: number): number =>
  Math.round(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, height)));

/** Rounded to a whole number, then kept between `min` and `max`. */
const clampBetween = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Math.round(value)));

const clampSplit = (split: number): number =>
  clampBetween(split, MIN_SPLIT, MAX_SPLIT);

/** In order, and every column at least {@link MIN_THIRD_WIDTH} wide. */
const clampLines = (
  lines: FixedLengthTuple<2, number>,
): FixedLengthTuple<2, number> => {
  const [lower, upper] =
    lines[0] <= lines[1] ? lines : ([lines[1], lines[0]] as const);

  const first = clampBetween(lower, MIN_THIRD_WIDTH, 100 - 2 * MIN_THIRD_WIDTH);

  return [
    first,
    clampBetween(upper, first + MIN_THIRD_WIDTH, 100 - MIN_THIRD_WIDTH),
  ];
};

/** To a tenth: fine enough for a drag to follow the pointer. */
const roundShare = (share: number): number => Math.round(share * 10) / 10;

const clampShare = (share: number): number =>
  roundShare(Math.min(MAX_SHARE, Math.max(MIN_SHARE, share)));
