/**
 * Which pull requests the merge order shows, and in what order.
 *
 * **The statuses** are the counts the merge order leads with. Each is a
 * switch: a pull request under any status switched off is hidden, whatever
 * else it is, so switching off `queued` leaves what is still waiting to be
 * looked at, and one under none of them is shown. Each can also be picked
 * ("only"): once any is, a pull request is shown only when it is under one
 * picked, whatever else it is, and still not under one switched off. "Only
 * failing" is not a set of statuses switched off, which is why picking is
 * its own choice: hiding the rest would still show what is under none of
 * them, and hide what is failing and also queued. A status is never both,
 * so picking one switches it back on, and switching one off unpicks it.
 *
 * **The priorities** are the `priority:*` labels, and "none" for a pull
 * request carrying no one of them; it is hidden when its priority is
 * switched off. Sorted by priority, siblings in the tree are ordered by the
 * best priority anywhere below them, since landing what is high means
 * landing what holds it up first, and "none" sits between mid and low.
 *
 * What is hidden gives its place to what is shown below it, so the tree
 * stays a tree. Everything is shown, in merge order, by default; what the
 * reader changes is kept (`settings-db.mts`).
 *
 * A draft is not one of the statuses: it is always shown, and its badge on
 * the card says what it is. Nor is being behind the base, which the card's
 * ahead / behind bar says. A choice saved while either was one drops it.
 */

import {
  MERGE_QUEUED_LABEL,
  PRIORITY_HIGH_LABEL,
  PRIORITY_LOW_LABEL,
  PRIORITY_MID_LABEL,
  type Label,
  type TreeNode,
} from 'pr-report-core';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Entry, PageSummary } from './load-report.mjs';

/** Named after the count of {@link PageSummary} each one is. */
export type StatusFilter = 'queued' | 'failing' | 'setAside' | 'awaitingReview';

export const STATUS_FILTERS = [
  'queued',
  'failing',
  'setAside',
  'awaitingReview',
] as const satisfies readonly (StatusFilter & keyof PageSummary)[];

/** What each status is called on the page. */
export const STATUS_NAMES = {
  queued: 'queued',
  failing: 'failing',
  setAside: 'set aside',
  awaitingReview: 'awaiting code owner',
} as const satisfies ReadonlyRecord<StatusFilter, string>;

export type Priority = 'high' | 'mid' | 'low' | 'none';

/** In the order the switches are drawn. */
export const PRIORITIES = [
  'high',
  'mid',
  'low',
  'none',
] as const satisfies readonly Priority[];

export type MergeOrderSort = 'order' | 'priority';

export type MergeOrderView = Readonly<{
  /**
   * What is switched off rather than on, so that a status added later is
   * shown to a reader whose choice was saved before it existed.
   */
  hiddenStatuses: readonly StatusFilter[];
  /** What is picked; nothing picked is no narrowing. */
  onlyStatuses: readonly StatusFilter[];
  hiddenPriorities: readonly Priority[];
  sort: MergeOrderSort;
}>;

export const DEFAULT_MERGE_ORDER_VIEW: MergeOrderView = {
  hiddenStatuses: [],
  onlyStatuses: [],
  hiddenPriorities: [],
  sort: 'order',
} as const;

/** The statuses the pull request is counted under, in their own order. */
export const statusesOf = (entry: Entry): readonly StatusFilter[] =>
  STATUS_FILTERS.filter((filter) => STATUS_TESTS[filter](entry));

/** The one `priority:*` label it carries; none, or several, is `none`. */
export const priorityOf = (labels: readonly Label[]): Priority => {
  const carried = PRIORITY_LABELS.filter(([, labelName]) =>
    labels.some((label) => label.name === labelName),
  );

  return Arr.isFixedLengthArray(1, carried) ? carried[0][0] : 'none';
};

export const isShown = (entry: Entry, view: MergeOrderView): boolean =>
  !view.hiddenPriorities.includes(priorityOf(entry.labels)) &&
  shownByStatus(statusesOf(entry), view);

/** The merge order as the view shows it. */
export const arrangeMergeOrder = (
  roots: readonly TreeNode[],
  entries: readonly Entry[],
  view: MergeOrderView,
): readonly TreeNode[] => {
  const byNumber = new Map(entries.map((entry) => [entry.number, entry]));

  return arrangeForest(roots, {
    shown: (number) => {
      const entry = byNumber.get(number);

      return entry !== undefined && isShown(entry, view);
    },
    rank:
      view.sort === 'priority'
        ? (number) => {
            const entry = byNumber.get(number);

            return PRIORITY_RANK[
              entry === undefined ? 'none' : priorityOf(entry.labels)
            ];
          }
        : () => 0,
  });
};

/**
 * The forest with what is not `shown` taken out, and siblings ordered by the
 * lowest `rank` in what is shown of them and below them, then by number —
 * the order `pr-report-core` draws them in, so ranking nothing changes
 * nothing.
 *
 * A pull request with several predecessors is expanded where it is first
 * drawn now, which hiding and sorting can move, and is a `repeated` line
 * everywhere after; a hidden one is neither.
 */
export const arrangeForest = (
  roots: readonly TreeNode[],
  {
    shown,
    rank,
  }: Readonly<{
    shown: (number: number) => boolean;
    rank: (number: number) => number;
  }>,
): readonly TreeNode[] => {
  // What waits for each, read from where it is expanded.
  const mut_children = new Map<number, readonly number[]>();

  const collect = (nodes: readonly TreeNode[]): void => {
    for (const node of nodes) {
      if (node.repeated) {
        continue;
      }

      mut_children.set(
        node.number,
        node.children.map((child) => child.number),
      );

      collect(node.children);
    }
  };

  collect(roots);

  const mut_shownBelow = new Map<number, readonly number[]>();

  const mut_bestRank = new Map<number, number>();

  // Each hidden one replaced by the shown ones below it.
  const shownAmong = (numbers: readonly number[]): readonly number[] =>
    Arr.uniq(numbers.flatMap((n) => (shown(n) ? [n] : shownBelow(n))));

  const shownBelow = (number: number): readonly number[] => {
    const memo = mut_shownBelow.get(number);

    if (memo !== undefined) {
      return memo;
    }

    const found = shownAmong(mut_children.get(number) ?? []);

    mut_shownBelow.set(number, found);

    return found;
  };

  const bestRank = (number: number): number => {
    const memo = mut_bestRank.get(number);

    if (memo !== undefined) {
      return memo;
    }

    const found = Math.min(rank(number), ...shownBelow(number).map(bestRank));

    mut_bestRank.set(number, found);

    return found;
  };

  const ordered = (numbers: readonly number[]): readonly number[] =>
    numbers.toSorted((a, b) => {
      const byRank = bestRank(a) - bestRank(b);

      return byRank === 0 ? a - b : byRank;
    });

  const mut_expanded = new Set<number>();

  const visit = (number: number): TreeNode => {
    if (mut_expanded.has(number)) {
      return { number, repeated: true, children: [] };
    }

    mut_expanded.add(number);

    return {
      number,
      repeated: false,
      children: ordered(shownBelow(number)).map(visit),
    };
  };

  return ordered(shownAmong(roots.map((node) => node.number))).map(visit);
};

/** How many of a kind the list shows, and how many there are. */
export type Count = Readonly<{ shown: number; total: number }>;

/** The counts the merge order leads with, as the view leaves them. */
export type MergeOrderCounts = Readonly<{
  open: Count;
  statuses: ReadonlyRecord<StatusFilter, Count>;
  priorities: ReadonlyRecord<Priority, Count>;
}>;

/**
 * What each count reads: how many the list shows, of how many are open.
 *
 * A count is also a switch, and one switched off would read nothing at all
 * if it counted the list alone, which is no help to whoever is deciding
 * whether to switch it back on. So each kind is counted with its own switch
 * on, and every other as it is: switched on, that is how many of the list
 * are under it; switched off, how many switching it on would bring back.
 */
export const countView = (
  entries: readonly Entry[],
  view: MergeOrderView,
): MergeOrderCounts => {
  const underStatus = (filter: StatusFilter): Count =>
    countUnder(entries, STATUS_TESTS[filter], {
      ...view,
      hiddenStatuses: view.hiddenStatuses.filter((each) => each !== filter),
    });

  const underPriority = (which: Priority): Count =>
    countUnder(entries, (entry) => priorityOf(entry.labels) === which, {
      ...view,
      hiddenPriorities: view.hiddenPriorities.filter((each) => each !== which),
    });

  return {
    open: countUnder(entries, () => true, view),
    statuses: {
      queued: underStatus('queued'),
      failing: underStatus('failing'),
      setAside: underStatus('setAside'),
      awaitingReview: underStatus('awaitingReview'),
    },
    priorities: {
      high: underPriority('high'),
      mid: underPriority('mid'),
      low: underPriority('low'),
      none: underPriority('none'),
    },
  } as const;
};

export const toggleStatus = (
  view: MergeOrderView,
  filter: StatusFilter,
): MergeOrderView =>
  ({
    ...view,
    hiddenStatuses: toggled(STATUS_FILTERS, view.hiddenStatuses, filter),
    onlyStatuses: view.onlyStatuses.filter((each) => each !== filter),
  }) as const;

export const toggleOnly = (
  view: MergeOrderView,
  filter: StatusFilter,
): MergeOrderView =>
  ({
    ...view,
    hiddenStatuses: view.hiddenStatuses.filter((each) => each !== filter),
    onlyStatuses: toggled(STATUS_FILTERS, view.onlyStatuses, filter),
  }) as const;

export const togglePriority = (
  view: MergeOrderView,
  priority: Priority,
): MergeOrderView =>
  ({
    ...view,
    hiddenPriorities: toggled(PRIORITIES, view.hiddenPriorities, priority),
  }) as const;

export const withSort = (
  view: MergeOrderView,
  sort: MergeOrderSort,
): MergeOrderView => ({ ...view, sort }) as const;

/**
 * What was saved, read forgivingly: anything it cannot make sense of is the
 * default, and a name it does not know is dropped, so a choice saved by an
 * older page still opens.
 */
export const parseMergeOrderView = (stored: unknown): MergeOrderView => {
  if (!isRecord(stored)) {
    return DEFAULT_MERGE_ORDER_VIEW;
  }

  return {
    hiddenStatuses: known(
      STATUS_FILTERS,
      hasKey(stored, 'hiddenStatuses') ? stored.hiddenStatuses : undefined,
    ),
    onlyStatuses: known(
      STATUS_FILTERS,
      hasKey(stored, 'onlyStatuses') ? stored.onlyStatuses : undefined,
    ),
    hiddenPriorities: known(
      PRIORITIES,
      hasKey(stored, 'hiddenPriorities') ? stored.hiddenPriorities : undefined,
    ),
    sort:
      hasKey(stored, 'sort') && stored.sort === 'priority'
        ? 'priority'
        : 'order',
  };
};

const countUnder = (
  entries: readonly Entry[],
  under: (entry: Entry) => boolean,
  view: MergeOrderView,
): Count => {
  const all = entries.filter(under);

  return {
    shown: all.filter((entry) => isShown(entry, view)).length,
    total: all.length,
  } as const;
};

const shownByStatus = (
  statuses: readonly StatusFilter[],
  view: MergeOrderView,
): boolean =>
  statuses.every((filter) => !view.hiddenStatuses.includes(filter)) &&
  (!Arr.isNonEmpty(view.onlyStatuses) ||
    statuses.some((filter) => view.onlyStatuses.includes(filter)));

/** The same tests `summarize` and `load-report.mts` count with. */
const STATUS_TESTS = {
  queued: (entry) =>
    entry.labels.some((label) => label.name === MERGE_QUEUED_LABEL),
  failing: (entry) => entry.checks.verdict === 'failing',
  setAside: (entry) => entry.setAside?.current === true,
  awaitingReview: (entry) => entry.codeOwnerReview.state === 'required',
} as const satisfies ReadonlyRecord<StatusFilter, (entry: Entry) => boolean>;

const PRIORITY_LABELS = [
  ['high', PRIORITY_HIGH_LABEL],
  ['mid', PRIORITY_MID_LABEL],
  ['low', PRIORITY_LOW_LABEL],
] as const satisfies readonly (readonly [Priority, string])[];

/** Lower first. No priority is between mid and low. */
const PRIORITY_RANK = {
  high: 0,
  mid: 1,
  none: 2,
  low: 3,
} as const satisfies ReadonlyRecord<Priority, number>;

/** `all` with `item` flipped in or out of `current`, in the order of `all`. */
const toggled = <T extends string>(
  all: readonly T[],
  current: readonly T[],
  item: T,
): readonly T[] =>
  all.filter((each) => (each === item) !== current.includes(each));

/** The names in `all` that `stored` lists, in the order of `all`. */
const known = <T extends string>(
  all: readonly T[],
  stored: unknown,
): readonly T[] =>
  Arr.isArray(stored)
    ? all.filter((each) => stored.includes(each))
    : ([] as const);
