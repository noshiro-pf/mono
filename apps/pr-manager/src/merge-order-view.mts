/**
 * Which pull requests the merge order shows, and in what order.
 *
 * **The statuses** are the counts the merge order leads with. Each is a switch:
 * a pull request under any status switched off is hidden, whatever else it is,
 * so switching off `queued` leaves what is still waiting to be looked at, and
 * one under none of them is shown. Each can also be picked ("only"): once any
 * is, a pull request is shown only when it is under one picked, whatever else
 * it is, and still not under one switched off. "Only failing" is not a set of
 * statuses switched off, which is why picking is its own choice: hiding the
 * rest would still show what is under none of them, and hide what is failing
 * and also queued. A status is never both, so picking one switches it back on,
 * and switching one off unpicks it.
 *
 * **The priorities** are the `priority:*` labels, and "none" for a pull request
 * carrying no one of them; it is hidden when its priority is switched off.
 * Sorted by priority, siblings in the tree are ordered by the best priority
 * anywhere below them, since landing what is high means landing what holds it
 * up first, and "none" sits between mid and low.
 *
 * **The drafts** are one switch: switched off, a draft is hidden whatever else
 * it is, which leaves what nobody is still working on.
 *
 * What is hidden gives its place to what is shown below it, so the tree stays a
 * tree. Everything is shown, in merge order, by default.
 *
 * **Kept in the query string**, as the layout is (`layout.mts`), so that a
 * bookmark or a pasted link opens on the same pull requests; only what differs
 * from {@link DEFAULT_MERGE_ORDER_VIEW} is written:
 * `prs.hide=queued.setAside` (the statuses switched off), `prs.only=failing`
 * (the ones picked), `prs.hidePriority=low.none`, `prs.hideDrafts=1` and
 * `prs.sort=priority`. A name it does not know is dropped, so a URL written by
 * an older page, or edited by hand, still opens.
 *
 * **Searched for on GitHub** ({@link githubSearchOf}) as far as GitHub's search
 * can say it, for the block's "on GitHub" link.
 *
 * A draft is not one of the statuses, which are counts a pull request is under
 * as well as whatever else it is, and which "only" can pick; its switch is
 * beside the priorities, and its badge on the card says what it is. Nor is
 * being behind the base, which the card's ahead / behind bar says. A choice
 * saved while either was a status drops it.
 */

import {
  MERGE_QUEUED_LABEL,
  PENDING_LABEL,
  type TreeNode,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { anyLabelQualifier, notLabelQualifier } from './label-search.mjs';
import type { Entry, PageSummary } from './load-report.mjs';
import {
  PRIORITIES,
  PRIORITY_LABELS,
  PRIORITY_RANK,
  priorityOf,
  type Priority,
} from './priority.mjs';
import {
  currentSearch,
  flagParam,
  namesParam,
  rewriteSearch,
  searchOf,
  setFlagParam,
  setNamesParam,
} from './url.mjs';

/** Named after the count of {@link PageSummary} each one is. */
export type StatusFilter =
  'queued' | 'failing' | 'setAside' | 'awaitingReview' | 'pending';

export const STATUS_FILTERS = [
  'queued',
  'failing',
  'setAside',
  'awaitingReview',
  'pending',
] as const satisfies readonly (StatusFilter & keyof PageSummary)[];

/**
 * The statuses on offer. `queued` and `set aside` are `unblock-prs`'s, and
 * `awaiting code owner` is what a ruleset on the default branch asks for, so
 * where the repository does not run the one or ask for the other
 * (`RepoFeatures` in `load-report.mts`) they are counts that are always nought,
 * and switches that do nothing; they are left out there.
 */
export const statusFiltersOf = (
  features: Readonly<{ queue: boolean; codeOwnerReview: boolean }>,
): readonly StatusFilter[] =>
  STATUS_FILTERS.filter(
    (filter) =>
      (features.queue || !QUEUE_STATUSES.has(filter)) &&
      (features.codeOwnerReview || filter !== 'awaitingReview'),
  );

/**
 * The view as it applies where only `available` is on offer: what it hides or
 * picks of the rest is ignored rather than forgotten, so the choice comes back
 * on a repository that has them — the choice is in the URL, which goes along to
 * another repository.
 */
export const withAvailable = (
  view: MergeOrderView,
  available: readonly StatusFilter[],
): MergeOrderView =>
  view.hiddenStatuses.every((each) => available.includes(each)) &&
  view.onlyStatuses.every((each) => available.includes(each))
    ? view
    : ({
        ...view,
        hiddenStatuses: view.hiddenStatuses.filter((each) =>
          available.includes(each),
        ),
        onlyStatuses: view.onlyStatuses.filter((each) =>
          available.includes(each),
        ),
      } as const);

/** What each status is called on the page. */
export const STATUS_NAMES = {
  queued: 'queued',
  failing: 'failing',
  setAside: 'set aside',
  awaitingReview: 'awaiting code owner',
  pending: 'pending',
} as const satisfies ReadonlyRecord<StatusFilter, string>;

export type MergeOrderSort = 'order' | 'priority';

export type MergeOrderView = Readonly<{
  /**
   * What is switched off rather than on, so that a status added later is shown
   * to a reader whose choice was saved before it existed.
   */
  hiddenStatuses: readonly StatusFilter[];
  /** What is picked; nothing picked is no narrowing. */
  onlyStatuses: readonly StatusFilter[];
  hiddenPriorities: readonly Priority[];
  hideDrafts: boolean;
  sort: MergeOrderSort;
}>;

export const DEFAULT_MERGE_ORDER_VIEW: MergeOrderView = {
  hiddenStatuses: [],
  onlyStatuses: [],
  hiddenPriorities: [],
  hideDrafts: false,
  sort: 'order',
} as const;

/** The statuses the pull request is counted under, in their own order. */
export const statusesOf = (entry: Entry): readonly StatusFilter[] =>
  STATUS_FILTERS.filter((filter) => STATUS_TESTS[filter](entry));

export const isShown = (entry: Entry, view: MergeOrderView): boolean =>
  !(view.hideDrafts && entry.isDraft) &&
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
 * lowest `rank` in what is shown of them and below them, then by number — the
 * order `pr-report-core` draws them in, so ranking nothing changes nothing.
 *
 * A pull request with several predecessors is expanded where it is first drawn
 * now, which hiding and sorting can move, and is a `repeated` line everywhere
 * after; a hidden one is neither.
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
  drafts: Count;
}>;

/**
 * What each count reads: how many the list shows, of how many are open.
 *
 * A count is also a switch, and one switched off would read nothing at all if
 * it counted the list alone, which is no help to whoever is deciding whether to
 * switch it back on. So each kind is counted with its own switch on, and every
 * other as it is: switched on, that is how many of the list are under it;
 * switched off, how many switching it on would bring back.
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
      pending: underStatus('pending'),
    },
    priorities: {
      high: underPriority('high'),
      mid: underPriority('mid'),
      low: underPriority('low'),
      none: underPriority('none'),
    },
    drafts: countUnder(entries, (entry) => entry.isDraft, {
      ...view,
      hideDrafts: false,
    }),
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

export const toggleDrafts = (view: MergeOrderView): MergeOrderView =>
  ({ ...view, hideDrafts: !view.hideDrafts }) as const;

export const withSort = (
  view: MergeOrderView,
  sort: MergeOrderSort,
): MergeOrderView => ({ ...view, sort }) as const;

/** The view as a GitHub pull request search, as far as one can say it. */
export type MergeOrderSearch = Readonly<{
  /** What to add to `is:pr is:open`. */
  qualifiers: readonly string[];
  /**
   * The statuses switched off that the search cannot leave out, so that
   * GitHub lists those too.
   */
  unhidden: readonly StatusFilter[];
  /**
   * The statuses picked, when the search cannot pick them, so that GitHub lists
   * the rest too.
   */
  unpicked: readonly StatusFilter[];
}>;

/**
 * The qualifiers GitHub's search narrows to what the view shows.
 *
 * `queued` and `pending` are labels, and so are the priorities: one switched
 * off is `-label:`, and those picked are one `label:` listing them, which
 * GitHub reads as any of them. `failing`, `set aside` and `awaiting code owner`
 * are the page's own reading of checks, `unblock-prs`'s comments and the
 * ruleset — `status:` and `review:` read GitHub's, which say something else —
 * so one switched off is left out, and picking one of them leaves out the
 * picking altogether, since "queued or failing" is no search GitHub has.
 *
 * `none` switched off asks for one of the priority labels. A pull request
 * carrying several, which the page counts as `none`, is where the two can still
 * differ, either way. Drafts switched off are `draft:false`. The order is not
 * searched for: GitHub has no merge order.
 */
export const githubSearchOf = (view: MergeOrderView): MergeOrderSearch => {
  const hiddenLabels = labelsOf(view.hiddenStatuses).map(notLabelQualifier);

  const pickedLabels = labelsOf(view.onlyStatuses);

  const isPickingSearchable = pickedLabels.length === view.onlyStatuses.length;

  const priorities = [
    ...PRIORITY_LABELS.filter(([priority]) =>
      view.hiddenPriorities.includes(priority),
    ).map(([, label]) => notLabelQualifier(label)),
    ...(view.hiddenPriorities.includes('none')
      ? ([
          anyLabelQualifier(PRIORITY_LABELS.map(([, label]) => label)),
        ] as const)
      : ([] as const)),
  ] as const;

  return {
    qualifiers: [
      ...hiddenLabels,
      ...(isPickingSearchable && Arr.isNonEmpty(pickedLabels)
        ? [anyLabelQualifier(pickedLabels)]
        : []),
      ...priorities,
      ...(view.hideDrafts ? ['draft:false'] : []),
    ],
    unhidden: view.hiddenStatuses.filter(
      (filter) => STATUS_LABELS[filter] === undefined,
    ),
    unpicked: isPickingSearchable ? [] : view.onlyStatuses,
  } as const;
};

/**
 * The "on GitHub" link's tooltip: what it lists, and where it lists more than
 * the page does.
 */
export const githubSearchTitle = ({
  unhidden,
  unpicked,
}: MergeOrderSearch): string =>
  [
    'The open pull requests as the filters leave them, in no merge order.',
    ...(Arr.isNonEmpty(unhidden)
      ? [
          `GitHub's search cannot leave out ${namesOf(unhidden)}, so it lists those too.`,
        ]
      : []),
    ...(Arr.isNonEmpty(unpicked)
      ? [
          `GitHub's search cannot pick ${namesOf(unpicked)}, so it lists the rest too.`,
        ]
      : []),
  ].join(' ');

/**
 * The view the query string asks for. A status both switched off and picked,
 * which only a hand can write, is switched off.
 */
export const mergeOrderViewFromSearch = (search: string): MergeOrderView => {
  const params = new URLSearchParams(search);

  const hiddenStatuses = namesParam(STATUS_FILTERS, params.getAll(PARAM.hide));

  return {
    hiddenStatuses,
    onlyStatuses: namesParam(STATUS_FILTERS, params.getAll(PARAM.only)).filter(
      (each) => !hiddenStatuses.includes(each),
    ),
    hiddenPriorities: namesParam(PRIORITIES, params.getAll(PARAM.hidePriority)),
    hideDrafts: flagParam(params, PARAM.hideDrafts),
    sort: params.get(PARAM.sort) === 'priority' ? 'priority' : 'order',
  };
};

/** The query string with `view` written in, the rest as it was. */
export const searchWithMergeOrderView = (
  search: string,
  view: MergeOrderView,
): string => {
  const params = new URLSearchParams(search);

  setNamesParam(params, PARAM.hide, view.hiddenStatuses);

  setNamesParam(params, PARAM.only, view.onlyStatuses);

  setNamesParam(params, PARAM.hidePriority, view.hiddenPriorities);

  setFlagParam(params, PARAM.hideDrafts, view.hideDrafts);

  if (view.sort === 'priority') {
    params.set(PARAM.sort, view.sort);
  } else {
    params.delete(PARAM.sort);
  }

  return searchOf(params);
};

/** What the query string asks for, now. */
export const mergeOrderViewFromLocation = (): MergeOrderView =>
  mergeOrderViewFromSearch(currentSearch());

/** Writes the view into the address bar; see `rewriteSearch`. */
export const saveMergeOrderView = (view: MergeOrderView): void => {
  rewriteSearch((search) => searchWithMergeOrderView(search, view));
};

/** `all` with `item` flipped in or out of `current`, in the order of `all`. */
export const toggled = <T extends string>(
  all: readonly T[],
  current: readonly T[],
  item: T,
): readonly T[] =>
  all.filter((each) => (each === item) !== current.includes(each));

/**
 * The label each status is, where it is one: what the page tests for and what
 * {@link githubSearchOf} asks GitHub for, so the two cannot name different
 * ones.
 */
const STATUS_LABELS = {
  queued: MERGE_QUEUED_LABEL,
  failing: undefined,
  setAside: undefined,
  awaitingReview: undefined,
  pending: PENDING_LABEL,
} as const satisfies ReadonlyRecord<StatusFilter, string | undefined>;

/** The labels of those of `filters` that are labels. */
const labelsOf = (filters: readonly StatusFilter[]): readonly string[] =>
  Arr.generate(function* () {
    for (const filter of filters) {
      const label: string | undefined = STATUS_LABELS[filter];

      if (label !== undefined) {
        yield label;
      }
    }
  });

/** “queued”, “failing” */
const namesOf = (filters: readonly StatusFilter[]): string =>
  filters.map((filter) => `“${STATUS_NAMES[filter]}”`).join(', ');

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
    entry.labels.some((label) => label.name === STATUS_LABELS.queued),
  failing: (entry) => entry.checks.verdict === 'failing',
  setAside: (entry) => entry.setAside?.current === true,
  awaitingReview: (entry) => entry.codeOwnerReview.state === 'required',
  pending: (entry) =>
    entry.labels.some((label) => label.name === STATUS_LABELS.pending),
} as const satisfies ReadonlyRecord<StatusFilter, (entry: Entry) => boolean>;

const PARAM = {
  hide: 'prs.hide',
  only: 'prs.only',
  hidePriority: 'prs.hidePriority',
  hideDrafts: 'prs.hideDrafts',
  sort: 'prs.sort',
} as const;

const QUEUE_STATUSES: ReadonlySet<StatusFilter> = new Set<StatusFilter>([
  'queued',
  'setAside',
]);
