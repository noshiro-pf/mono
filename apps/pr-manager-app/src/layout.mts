/**
 * How the page's three blocks are laid out, and how that is kept in the URL.
 *
 * **The blocks** are the merge order (with the cycles under it), what merged,
 * and the open issues. Each can be given a height, and then scrolls on its
 * own; without one it is as tall as what it holds. They can be put in one
 * column or two, in any order, and with two the divider between them moves.
 *
 * **Kept in the query string**, as the theme is (`theme.mts`), and for the
 * same reasons: a bookmark or a pasted link opens the same way, and nothing
 * is added to a `localStorage` every app on the origin shares. Only what
 * differs from {@link DEFAULT_LAYOUT} is written, so a page laid out the
 * usual way has a URL that says nothing about it:
 *
 * - `cols=2`: two columns. Absent is one; alone, it splits the blocks as
 *   the settings would.
 * - `left=open.merged`, `right=issues`: the blocks in each column, top down,
 *   joined with `.`, which `URLSearchParams` does not escape. With one column
 *   only `left` is written, and only when it is not the usual order.
 * - `split=40`: the left column's share of the width, in percent.
 * - `h.open=480`: a block's height, in CSS pixels.
 *
 * Reading forgives: an unknown or repeated block is dropped, a missing one is
 * put back at the end of the left column, and a number out of range is
 * clamped. A URL written by an older page, or edited by hand, still opens.
 */

import { Arr, Num, Obj, Result } from 'ts-data-forge';
import { type ReadonlyRecord, type StrictPick } from 'ts-type-forge';
import { currentSearch, rewriteSearch } from './url.mjs';

/** Said here rather than on each member, which `fix:codemod:full` drops (#2042). */
export type BlockId = 'open' | 'merged' | 'issues';

export const BLOCK_IDS = [
  'open',
  'merged',
  'issues',
] as const satisfies readonly BlockId[];

/** What each block is called in the view settings. */
export const BLOCK_NAMES = {
  open: 'Merge order',
  merged: 'Merged',
  issues: 'Open issues',
} as const satisfies ReadonlyRecord<BlockId, string>;

/** `0` is the left column, `1` the right. */
export type ColumnIndex = 0 | 1;

export type Layout = Readonly<{
  columns: 1 | 2;
  /** Top down. With one column this is every block, and `right` is empty. */
  left: readonly BlockId[];
  right: readonly BlockId[];
  /** The left column's share of the width, in percent. */
  split: number;
  /** In CSS pixels. A block without one is as tall as what it holds. */
  heights: Partial<ReadonlyRecord<BlockId, number>>;
}>;

export type DropTarget = Readonly<{ column: ColumnIndex; index: number }>;

export const DEFAULT_LAYOUT: Layout = {
  columns: 1,
  left: BLOCK_IDS,
  right: [],
  split: 50,
  heights: {},
} as const;

export const MIN_HEIGHT = 120;

export const MAX_HEIGHT = 4000;

export const MIN_SPLIT = 20;

export const MAX_SPLIT = 80;

export const layoutFromSearch = (search: string): Layout => {
  const params = new URLSearchParams(search);

  const columns = params.get(PARAM.columns) === '2' ? 2 : 1;

  const split = numberParam(params.get(PARAM.split));

  const heights = Object.fromEntries(
    BLOCK_IDS.flatMap((id) => {
      const height = numberParam(params.get(heightParam(id)));

      return height === undefined ? [] : [[id, clampHeight(height)] as const];
    }),
  );

  const read: Layout = {
    ...arrange(
      columns,
      blockList(params.get(PARAM.left)),
      blockList(params.get(PARAM.right)),
    ),
    split: split === undefined ? DEFAULT_LAYOUT.split : clampSplit(split),
    heights,
  } as const;

  // `?cols=2` alone, as typed by hand, splits the columns the way the
  // settings would rather than leaving the right one empty.
  return columns === 2 && !params.has(PARAM.left) && !params.has(PARAM.right)
    ? withColumns({ ...read, columns: 1 }, 2)
    : read;
};

/** The query string with the layout written into it, the rest as it was. */
export const searchWithLayout = (search: string, layout: Layout): string => {
  const params = new URLSearchParams(search);

  for (const param of [
    PARAM.columns,
    PARAM.left,
    PARAM.right,
    PARAM.split,
    ...BLOCK_IDS.map(heightParam),
  ]) {
    params.delete(param);
  }

  if (layout.columns === 2) {
    params.set(PARAM.columns, '2');

    params.set(PARAM.left, layout.left.join(SEPARATOR));

    params.set(PARAM.right, layout.right.join(SEPARATOR));
  } else if (!Arr.eq(layout.left, DEFAULT_LAYOUT.left)) {
    params.set(PARAM.left, layout.left.join(SEPARATOR));
  }

  if (layout.split !== DEFAULT_LAYOUT.split) {
    params.set(PARAM.split, String(layout.split));
  }

  for (const id of BLOCK_IDS) {
    const height = layout.heights[id];

    if (height !== undefined) {
      params.set(heightParam(id), String(height));
    }
  }

  const written = params.toString();

  return written === '' ? '' : `?${written}`;
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
 * right, which is the split that leaves the merge order the most room; two
 * that both hold something are left as they are. One from two is the left
 * column, then the right.
 */
export const withColumns = (layout: Layout, columns: 1 | 2): Layout => {
  if (columns === 1) {
    return { ...layout, ...arrange(1, layout.left, layout.right) };
  }

  if (layout.columns === 2 && Arr.isNonEmpty(layout.left)) {
    return layout;
  }

  const [first, ...rest] = [...layout.left, ...layout.right] as const;

  return {
    ...layout,
    ...arrange(2, first === undefined ? [] : [first], rest),
  };
};

/**
 * Takes `block` out of wherever it is and puts it at `target`, whose index
 * counts the blocks already there without it. With one column there is only
 * the left.
 */
export const moveBlock = (
  layout: Layout,
  block: BlockId,
  target: DropTarget,
): Layout => {
  const left = layout.left.filter((id) => id !== block);

  const right = layout.right.filter((id) => id !== block);

  const column = layout.columns === 1 ? 0 : target.column;

  const into = column === 0 ? left : right;

  const index = Math.max(0, Math.min(target.index, into.length));

  const placed = [
    ...into.slice(0, index),
    block,
    ...into.slice(index),
  ] as const;

  return column === 0
    ? { ...layout, left: placed, right }
    : { ...layout, left, right: placed };
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

export const withSplit = (layout: Layout, split: number): Layout =>
  ({
    ...layout,
    split: clampSplit(split),
  }) as const;

/**
 * Where a dragged block lands in a column: after every block whose middle is
 * above the pointer. `midpoints` are the other blocks' vertical centres, top
 * down, in the same coordinates as `y`.
 */
export const dropIndex = (midpoints: readonly number[], y: number): number =>
  midpoints.filter((middle) => middle < y).length;

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

/** A column as drawn, in the same coordinates as the pointer. */
export type ColumnBox = Readonly<{
  column: ColumnIndex;
  left: number;
  right: number;
  top: number;
  bottom: number;
  /** The vertical centres of its blocks, the dragged one left out. */
  midpoints: readonly number[];
}>;

/**
 * Where a block dragged to (`x`, `y`) lands: in the column under the pointer
 * — the nearest one when it is between, beside or below them, measured both
 * ways because on a narrow screen the two are stacked and equally near
 * sideways — after every block there whose middle is above it.
 */
export const nearestDropTarget = (
  columns: readonly ColumnBox[],
  x: number,
  y: number,
): DropTarget | undefined => {
  const nearest = columns
    .map((box) => ({
      box,
      distance: Math.hypot(
        Math.max(0, box.left - x, x - box.right),
        Math.max(0, box.top - y, y - box.bottom),
      ),
    }))
    .toSorted((a, b) => a.distance - b.distance)
    .at(0)?.box;

  return nearest === undefined
    ? undefined
    : { column: nearest.column, index: dropIndex(nearest.midpoints, y) };
};

const PARAM = {
  columns: 'cols',
  left: 'left',
  right: 'right',
  split: 'split',
} as const;

const SEPARATOR = '.';

const heightParam = (id: BlockId): string => `h.${id}` as const;

/** Absent, empty and not-a-number are all no number. */
const numberParam = (raw: string | null): number | undefined => {
  if (raw === null) {
    return undefined;
  }

  const parsed = Result.unwrapOkOr(Num.safeParseFloat(raw), Number.NaN);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const isBlockId = (value: string): value is BlockId =>
  (BLOCK_IDS as readonly string[]).includes(value);

const blockList = (raw: string | null): readonly BlockId[] =>
  raw === null ? ([] as const) : raw.split(SEPARATOR).filter(isBlockId);

/**
 * Every block exactly once: the first mention wins, and what is not
 * mentioned goes to the end of the left column.
 */
const arrange = (
  columns: 1 | 2,
  left: readonly BlockId[],
  right: readonly BlockId[],
): StrictPick<Layout, 'columns' | 'left' | 'right'> => {
  const ordered = Arr.uniq([...left, ...right]);

  const missing = BLOCK_IDS.filter((id) => !ordered.includes(id));

  if (columns === 1) {
    return { columns, left: [...ordered, ...missing], right: [] };
  }

  const leftOnly = Arr.uniq(left);

  const rightOnly = Arr.uniq(right).filter((id) => !leftOnly.includes(id));

  return { columns, left: [...leftOnly, ...missing], right: rightOnly };
};

const clampHeight = (height: number): number =>
  Math.round(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, height)));

const clampSplit = (split: number): number =>
  Math.round(Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, split)));
