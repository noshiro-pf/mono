import {
  Arr,
  asPositiveFiniteNumber,
  asPositiveInt,
  asUint32,
  Num,
  Obj,
} from 'ts-data-forge';
import type {
  FixedLengthTuple,
  NonEmptyTuple,
  ReadonlyRecord,
} from 'ts-type-forge';

/**
 * How the page's blocks are laid out (spec §6).
 *
 * A layout is up to three **columns**, each a list of **groups**, each a
 * non-empty list of **blocks** drawn as tabs of one place (a group of one is a
 * plain block). The first block of a group is its **head**: the group is drawn
 * with the head's height and share whether or not the head is shown, and a
 * change of head hands them on ({@link withSizesMoved}).
 *
 * Every block is in exactly one group. Hiding a block keeps it where it is,
 * with its sizes, so showing it puts it back; a block the repository does not
 * have (`absent`, the queue without a `merge-queued` label) is treated as
 * hidden when drawn and never written away.
 *
 * Every function here returns a normalized layout ({@link normalized}), so the
 * URL a layout writes has one spelling.
 */
export type BlockId = 'issues' | 'merged' | 'open' | 'queue' | 'runs';

export type Group = NonEmptyTuple<BlockId>;

export type Column = readonly Group[];

export type HeightMode = 'fill' | 'natural';

export type Layout = Readonly<{
  /** One to three. */
  columns: readonly Column[];
  /** With two columns, the left one's share of the width, in percent. */
  split: number;
  /** With three, where the two lines between them are, in percent. */
  lines: FixedLengthTuple<2, number>;
  mode: HeightMode;
  /** `natural` mode: a group's fixed height in CSS pixels, by its head. */
  heights: Partial<ReadonlyRecord<BlockId, number>>;
  /** `fill` mode: a group's weight in its column, by its head. */
  shares: Partial<ReadonlyRecord<BlockId, number>>;
  hidden: readonly BlockId[];
  /** Of each group, the tab shown when it is not the head. */
  selected: readonly BlockId[];
}>;

export const BLOCK_IDS = [
  'open',
  'queue',
  'runs',
  'merged',
  'issues',
] as const satisfies readonly BlockId[];

export const BLOCK_NAMES = {
  open: 'Merge order',
  queue: 'Queue',
  runs: 'Running workflows',
  merged: 'Merged',
  issues: 'Open issues',
} as const satisfies ReadonlyRecord<BlockId, string>;

export const DEFAULT_LAYOUT: Layout = {
  columns: [BLOCK_IDS.map((id) => [id] as const)],
  split: 50,
  lines: [33, 67],
  mode: 'natural',
  heights: {},
  shares: {},
  hidden: [],
  selected: [],
} as const;

export const LIMITS = {
  height: { min: 120, max: 4000 },
  share: { min: 10, max: 1000 },
  split: { min: 20, max: 80 },
  /** The narrowest a third column may be, in percent. */
  third: 15,
} as const;

/** The weight a group without a share of its own has. One row, the queue's is half. */
export const defaultShareOf = (head: BlockId): number =>
  head === 'queue' ? 50 : 100;

export const shareOf = (layout: Layout, head: BlockId): number =>
  layout.shares[head] ?? defaultShareOf(head);

// ---------------------------------------------------------------------------
// Reading the structure

/** Where a block is: its column, its group in the column, its tab in the group. */
export type Place = Readonly<{ column: number; group: number; tab: number }>;

export const placeOf = (layout: Layout, block: BlockId): Place => {
  for (const [column, groups] of layout.columns.entries()) {
    for (const [group, tabs] of groups.entries()) {
      const tab = tabs.indexOf(block);

      if (tab !== -1) {
        return { column, group, tab };
      }
    }
  }

  // Unreachable for a normalized layout, which holds every block.
  return { column: 0, group: 0, tab: 0 };
};

export const groupOf = (layout: Layout, block: BlockId): Group => {
  const { column, group } = placeOf(layout, block);

  return layout.columns[column]?.[group] ?? [block];
};

/** The tab a group shows: the selected one, or its head. */
export const selectedTabOf = (layout: Layout, group: Group): BlockId =>
  group.find((id) => layout.selected.includes(id)) ?? group[0];

/** Column widths in percent, left to right. */
export const columnWidths = (layout: Layout): readonly number[] => {
  switch (layout.columns.length) {
    case 2:
      return [layout.split, 100 - layout.split];

    case 3:
      return [
        layout.lines[0],
        layout.lines[1] - layout.lines[0],
        100 - layout.lines[1],
      ];

    default:
      return [100];
  }
};

// ---------------------------------------------------------------------------
// What is drawn

export type DrawnGroup = Readonly<{
  /** The group's head, which keys its sizes, shown or not. */
  head: BlockId;
  /** The blocks shown, in order: one, or several drawn as tabs. */
  tabs: NonEmptyTuple<BlockId>;
  /** The tab shown. */
  shown: BlockId;
  /** `natural` mode's fixed height, if any. */
  height: number | undefined;
  /** `fill` mode's weight. */
  share: number;
}>;

/**
 * The columns as drawn: hidden and absent blocks left out, empty groups gone.
 * A column left with nothing keeps its place (and its width).
 */
export const drawnColumns = (
  layout: Layout,
  absent: readonly BlockId[],
): readonly (readonly DrawnGroup[])[] =>
  layout.columns.map((groups) =>
    groups.flatMap((group) => {
      const tabs = group.filter(
        (id) => !layout.hidden.includes(id) && !absent.includes(id),
      );

      if (!Arr.isNonEmpty(tabs)) {
        return [];
      }

      const selected = selectedTabOf(layout, group);

      const drawnTabs = new Set<BlockId>(tabs);

      return [
        {
          head: group[0],
          tabs,
          shown: drawnTabs.has(selected) ? selected : tabs[0],
          height: layout.heights[group[0]],
          share: shareOf(layout, group[0]),
        },
      ];
    }),
  );

/** Each drawn group's share of its column, in whole percent. */
export const sharePercents = (
  groups: readonly DrawnGroup[],
): readonly number[] => {
  const total = Arr.sum(groups.map((g) => g.share));

  return groups.map((g) =>
    Num.isNonZero(total) ? Math.round(Num.div(g.share, total) * 100) : 0,
  );
};

// ---------------------------------------------------------------------------
// Changes

/**
 * One, two or three columns. Fewer joins the columns in order; more puts the
 * lead (the merge order with the queue under it, or the first group) on the
 * left, the last group on the right with three, and the rest between.
 */
export const withColumnCount = (layout: Layout, count: 1 | 2 | 3): Layout => {
  const current = layout.columns;

  if (current.length === count) {
    return layout;
  }

  if (count === 1) {
    return normalized({ ...layout, columns: [current.flat()] });
  }

  if (Arr.isFixedLengthArray(3, current)) {
    // 3 → 2: the middle joins the right.
    const [left, centre, right] = current;

    return normalized({ ...layout, columns: [left, [...centre, ...right]] });
  }

  if (Arr.isFixedLengthArray(2, current) && Arr.isNonEmpty(current[0])) {
    // 2 → 3: the right's last group becomes the third column.
    const [left = [], right = []] = current;

    const [between, third] = lastApart(right);

    return normalized({ ...layout, columns: [left, between, third] });
  }

  const all = current.flat();

  const leadLength =
    all[0]?.length === 1 && all[0][0] === 'open' && all[1]?.[0] === 'queue'
      ? 2
      : 1;

  const lead = all.slice(0, leadLength);

  const rest = all.slice(leadLength);

  const [middle, last] = lastApart(rest);

  return normalized({
    ...layout,
    columns: count === 2 ? [lead, rest] : [lead, middle, last],
  });
};

/**
 * Whether {@link stepBlock} can move `block` that way: within its group, or
 * past the group next to its own.
 */
export const canStep = (
  layout: Layout,
  block: BlockId,
  direction: 'down' | 'up',
): boolean => {
  const { column, group } = placeOf(layout, block);

  const groups = layout.columns[column] ?? [];

  return (
    (groups[group]?.length ?? 0) > 1 ||
    (direction === 'up' ? group > 0 : group < groups.length - 1)
  );
};

/**
 * Moves `block` one place up or down in its column. Within a group it swaps
 * with its neighbor tab, and at the group's edge it leaves the group as a block
 * of its own on that side; a block alone swaps with the whole group next to it,
 * so it never lands inside another group.
 */
export const stepBlock = (
  layout: Layout,
  block: BlockId,
  direction: 'down' | 'up',
): Layout => {
  const { column, group, tab } = placeOf(layout, block);

  const groups = layout.columns[column] ?? [];

  const own = groups[group];

  if (own === undefined) {
    return layout;
  }

  const step = direction === 'up' ? -1 : 1;

  if (own.length > 1) {
    const other = own[tab + step];

    if (other !== undefined) {
      const swap = (id: BlockId): BlockId =>
        id === block ? other : id === other ? block : id;

      const swapped: Group = Arr.toUnshifted(swap(own[0]))(
        Arr.tail(own).map(swap),
      );

      return withSizesMoved(
        withColumn(
          layout,
          column,
          groups.map((g, i) => (i === group ? swapped : g)),
        ),
        own[0],
        swapped[0],
      );
    }

    const rest = own.filter((id) => id !== block);

    const replaced = Arr.isNonEmpty(rest)
      ? direction === 'up'
        ? ([[block], rest] as const)
        : ([rest, [block]] as const)
      : ([own] as const);

    return withSizesMoved(
      withColumn(layout, column, [
        ...groups.slice(0, group),
        ...replaced,
        ...groups.slice(group + 1),
      ]),
      own[0],
      rest[0],
    );
  }

  const neighbor = groups[group + step];

  return neighbor === undefined
    ? layout
    : withColumn(
        layout,
        column,
        groups.map((g, i) =>
          i === group ? neighbor : i === group + step ? own : g,
        ),
      );
};

/** Whether `block` can go to the column on that side. */
export const canMoveAcross = (
  layout: Layout,
  block: BlockId,
  side: 'left' | 'right',
): boolean => {
  const { column } = placeOf(layout, block);

  return side === 'left' ? column > 0 : column < layout.columns.length - 1;
};

/** Moves `block` alone to the end of the column on that side. */
export const moveAcross = (
  layout: Layout,
  block: BlockId,
  side: 'left' | 'right',
): Layout => {
  if (!canMoveAcross(layout, block, side)) {
    return layout;
  }

  const { column, group } = placeOf(layout, block);

  const own = layout.columns[column]?.[group] ?? [block];

  const rest = own.filter((id) => id !== block);

  const target = column + (side === 'left' ? -1 : 1);

  const columns = layout.columns.map((groups, i) =>
    i === column
      ? groups.flatMap((g, j) =>
          j === group ? (Arr.isNonEmpty(rest) ? [rest] : []) : [g],
        )
      : i === target
        ? Arr.toPushed(groups, [block] as const)
        : groups,
  );

  return withSizesMoved(normalized({ ...layout, columns }), own[0], rest[0]);
};

/** Whether `block` heads a group with a group above it to join. */
export const canTab = (layout: Layout, block: BlockId): boolean => {
  const { group, tab } = placeOf(layout, block);

  return tab === 0 && group > 0;
};

/** Whether `block` is a tab other than the head, which can leave. */
export const canSeparate = (layout: Layout, block: BlockId): boolean =>
  placeOf(layout, block).tab > 0;

/**
 * Makes `block`'s group tabs of the group above it, or splits the group at
 * `block` so that it heads a group of its own with the tabs after it. Groups
 * above with nothing drawn (`absent` or hidden) are joined too, so the tab
 * lands beside something visible.
 */
export const withTabbed = (
  layout: Layout,
  block: BlockId,
  tabbed: boolean,
  absent: readonly BlockId[] = [],
): Layout => {
  const { column, group, tab } = placeOf(layout, block);

  const groups = layout.columns[column] ?? [];

  if (!tabbed) {
    const own = groups[group];

    if (own === undefined || tab === 0) {
      return layout;
    }

    const before = own.slice(0, tab);

    const after = own.slice(tab);

    return Arr.isNonEmpty(before) && Arr.isNonEmpty(after)
      ? withColumn(layout, column, [
          ...groups.slice(0, group),
          before,
          after,
          ...groups.slice(group + 1),
        ])
      : layout;
  }

  if (tab !== 0 || group === 0) {
    return layout;
  }

  const drawn = (g: Group): boolean =>
    g.some((id) => !layout.hidden.includes(id) && !absent.includes(id));

  const into = Math.max(0, groups.slice(0, group).findLastIndex(drawn));

  const joined = groups.slice(into, group + 1).flat();

  // The heads that join stop keying sizes; what they had would come back,
  // stale, if they were split out again.
  const joining = groups.slice(into + 1, group + 1).map((g) => g[0]);

  return Arr.isNonEmpty(joined)
    ? withColumn(
        joining.reduce(
          (l, head) =>
            withShare(withHeight(l, head, undefined), head, undefined),
          layout,
        ),
        column,
        [...groups.slice(0, into), joined, ...groups.slice(group + 1)],
      )
    : layout;
};

export const withSelectedTab = (layout: Layout, block: BlockId): Layout => {
  const group = groupOf(layout, block);

  return normalized({
    ...layout,
    selected: Arr.toPushed(
      layout.selected.filter((id) => !group.includes(id)),
      block,
    ),
  });
};

export const withHidden = (
  layout: Layout,
  block: BlockId,
  hidden: boolean,
): Layout =>
  normalized({
    ...layout,
    hidden: hidden
      ? Arr.toPushed(layout.hidden, block)
      : layout.hidden.filter((id) => id !== block),
  });

export const withMode = (layout: Layout, mode: HeightMode): Layout =>
  ({
    ...layout,
    mode,
  }) as const;

/** A group's fixed height, or none for its natural height. */
export const withHeight = (
  layout: Layout,
  head: BlockId,
  height: number | undefined,
): Layout =>
  ({
    ...layout,
    heights: withEntry(layout.heights, head, height, LIMITS.height),
  }) as const;

/** Whether `share` is `head`'s default, which is kept as none. */
export const isDefaultShare = (head: BlockId, share: number): boolean =>
  Math.round(share) === defaultShareOf(head);

/** A group's weight; none, or the default, is written as none. */
export const withShare = (
  layout: Layout,
  head: BlockId,
  share: number | undefined,
): Layout =>
  ({
    ...layout,
    shares: withEntry(
      layout.shares,
      head,
      share === undefined || isDefaultShare(head, share) ? undefined : share,
      LIMITS.share,
    ),
  }) as const;

/** Gives every one of `heads` the mean of their weights. */
export const withEvenShares = (
  layout: Layout,
  heads: readonly BlockId[],
): Layout => {
  if (!Arr.isNonEmpty(heads)) {
    return layout;
  }

  const mean = Num.div(
    Arr.sum(heads.map((h) => shareOf(layout, h))),
    asPositiveInt(heads.length),
  );

  return heads.reduce((acc, head) => withShare(acc, head, mean), layout);
};

/**
 * Moves weight between two neighboring groups so that the line between them
 * sits `dy` pixels from where the drag started. `start` is what both measured
 * then; neither is left shorter than {@link MIN_FILL_HEIGHT}.
 */
export const withBoundaryMoved = (
  layout: Layout,
  start: Readonly<{
    upper: BlockId;
    lower: BlockId;
    upperHeight: number;
    lowerHeight: number;
    upperShare: number;
    lowerShare: number;
  }>,
  dy: number,
): Layout => {
  const total = start.upperHeight + start.lowerHeight;

  if (!Num.isNonZero(total)) {
    return layout;
  }

  const least = Math.min(MIN_FILL_HEIGHT, total / 2);

  const upperHeight = clamp(start.upperHeight + dy, least, total - least);

  // No two shares make a ratio past the least against the most (10:1000).
  const leastPart = Num.div(
    LIMITS.share.min,
    asPositiveInt(LIMITS.share.min + LIMITS.share.max),
  );

  const upperPart = clamp(
    Num.div(upperHeight, total),
    leastPart,
    1 - leastPart,
  );

  // The pair's weight, raised where the smaller share would fall under the
  // least a share may be and lowered where the larger would pass the most:
  // both are clamped on their own, and two weights that no longer make the
  // dragged ratio would move the line off the pointer. Within the ratios above,
  // the raised weight never passes the lowered one.
  const smaller = asPositiveFiniteNumber(Math.min(upperPart, 1 - upperPart));

  const larger = asPositiveFiniteNumber(1 - smaller);

  const weight = Math.min(
    Math.floor(Num.div(LIMITS.share.max, larger)),
    Math.max(
      start.upperShare + start.lowerShare,
      Math.ceil(Num.div(LIMITS.share.min, smaller)),
    ),
  );

  return withShare(
    withShare(layout, start.upper, Math.round(weight * upperPart)),
    start.lower,
    Math.round(weight * (1 - upperPart)),
  );
};

export const MIN_FILL_HEIGHT = 80;

export const withSplit = (layout: Layout, split: number): Layout =>
  ({
    ...layout,
    split: Math.round(clamp(split, LIMITS.split.min, LIMITS.split.max)),
  }) as const;

/**
 * With three columns, moves line `line` to `at` percent, each column kept at
 * least {@link LIMITS.third} wide; with two, the split.
 */
export const withLineAt = (layout: Layout, line: 0 | 1, at: number): Layout => {
  if (!Arr.isFixedLengthArray(3, layout.columns)) {
    return withSplit(layout, at);
  }

  const { min, max } = lineRange(layout, line);

  const moved = Math.round(clamp(at, min, max));

  const [first, second] = layout.lines;

  return {
    ...layout,
    lines: line === 0 ? [moved, second] : [first, moved],
  };
};

/** The percents {@link withLineAt} lets line `line` take, for a slider's ends. */
export const lineRange = (
  layout: Layout,
  line: 0 | 1,
): Readonly<{ min: number; max: number }> => {
  if (!Arr.isFixedLengthArray(3, layout.columns)) {
    return LIMITS.split;
  }

  const [first, second] = layout.lines;

  return line === 0
    ? { min: LIMITS.third, max: second - LIMITS.third }
    : { min: first + LIMITS.third, max: 100 - LIMITS.third };
};

/** Evens the two columns beside line `line`; with three, the third keeps its width. */
export const withEvenLine = (layout: Layout, line: 0 | 1): Layout => {
  if (!Arr.isFixedLengthArray(3, layout.columns)) {
    return withSplit(layout, DEFAULT_LAYOUT.split);
  }

  const [first, second] = layout.lines;

  return withLineAt(layout, line, line === 0 ? second / 2 : (first + 100) / 2);
};

// ---------------------------------------------------------------------------
// Normalising

/**
 * One spelling for every layout: each block exactly once (unknown and repeated
 * ones dropped, missing ones put back), no empty group, one to three columns,
 * `selected` holding only a non-head tab, one per group, and `hidden` in the
 * usual order.
 *
 * A missing queue goes under the merge order (into its group when the block
 * under it is a tab of that group), the place older URLs had it; any other
 * missing block goes to the end of the left column.
 */
export const normalized = (layout: Layout): Layout => {
  const columns = keptOnce(Arr.take(layout.columns, 3));

  const seen = new Set(columns.flat(/* columns → groups → blocks */ 2));

  const withQueue = seen.has('queue') ? columns : queuePutBack(columns);

  const missing = BLOCK_IDS.filter((id) => id !== 'queue' && !seen.has(id));

  const placed = Arr.isNonEmpty(withQueue)
    ? updatedAt(withQueue, 0, (left) => [
        ...left,
        ...missing.map((id) => [id] as const),
      ])
    : ([missing.map((id) => [id] as const)] as const);

  const selected = Arr.generate(function* () {
    for (const group of placed.flat()) {
      const chosen = group.find((id) => layout.selected.includes(id));

      if (chosen !== undefined && chosen !== group[0]) {
        yield chosen;
      }
    }
  });

  return {
    ...layout,
    columns: placed,
    hidden: BLOCK_IDS.filter((id) => layout.hidden.includes(id)),
    selected,
  };
};

/**
 * Hands the sizes keyed by `from` to `to` when a group's head changes from one
 * to the other, so the group keeps the height and share it had.
 */
export const withSizesMoved = (
  layout: Layout,
  from: BlockId,
  to: BlockId | undefined,
): Layout => {
  if (to === undefined || from === to) {
    return layout;
  }

  const height = layout.heights[from];

  // The new head takes the group's share as it applies, not as stored: the
  // default depends on the head (the queue's is smaller), and the group's
  // weight must not change with its head. The old head keeps nothing: what a
  // block not at the head had stored is stale, so apart again it starts from
  // its own default, and stepping back hands the sizes back.
  const share = shareOf(layout, from);

  return withShare(
    withHeight(
      withShare(withHeight(layout, from, undefined), from, undefined),
      to,
      height,
    ),
    to,
    share,
  );
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

// ---------------------------------------------------------------------------
// Helpers

const updatedAt = <T,>(
  array: readonly T[],
  index: number,
  update: (value: T) => T,
): readonly T[] =>
  array.map((value, i) => (i === index ? update(value) : value));

const withEntry = (
  record: Partial<ReadonlyRecord<BlockId, number>>,
  key: BlockId,
  value: number | undefined,
  limits: Readonly<{ min: number; max: number }>,
): Partial<ReadonlyRecord<BlockId, number>> => {
  const rest = Obj.filter(record, (_value, id) => id !== key);

  return value === undefined
    ? rest
    : { ...rest, [key]: Math.round(clamp(value, limits.min, limits.max)) };
};

/** The groups but the last, and the last alone. */
const lastApart = (groups: Column): FixedLengthTuple<2, Column> => {
  const last = groups.at(-1);

  // `Arr.butLast` would be the canonical spelling, but its tuple types over a
  // list of non-empty tuples of a union exceed what TypeScript can represent
  // (TS2590).
  // eslint-disable-next-line ts-data-forge/prefer-canonical-array-slicing
  return last === undefined ? [[], []] : [groups.toSpliced(-1), [last]];
};

const keptOnce = (columns: readonly Column[]): readonly Column[] => {
  const mut_seen = new Set<BlockId>();

  return columns.map((groups) =>
    Arr.generate(function* () {
      for (const group of groups) {
        const kept = group.filter((id) => {
          const first = !mut_seen.has(id);

          mut_seen.add(id);

          return first;
        });

        if (Arr.isNonEmpty(kept)) {
          yield kept;
        }
      }
    }),
  );
};

const queuePutBack = (columns: readonly Column[]): readonly Column[] => {
  const at = columns.findIndex((groups) =>
    groups.some((g) => g.includes('open')),
  );

  if (at === -1) {
    return Arr.isNonEmpty(columns)
      ? updatedAt(columns, 0, Arr.toPushed(['queue'] as const))
      : [[['queue']]];
  }

  return updatedAt(columns, at, (groups) =>
    groups.flatMap((group): readonly Group[] => {
      const index = group.indexOf('open');

      if (index === -1) {
        return [group];
      }

      if (index === group.length - 1) {
        return [group, ['queue']];
      }

      // Inside a group with tabs after the merge order, the queue is one more
      // tab rather than a block splitting the group.
      const [head, ...tail] = group;

      return [[head, ...Arr.toInserted(tail, asUint32(index), 'queue')]];
    }),
  );
};

const withColumn = (layout: Layout, column: number, groups: Column): Layout =>
  normalized({
    ...layout,
    columns: layout.columns.map((g, i) => (i === column ? groups : g)),
  });
