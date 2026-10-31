/**
 * Which open issues the list shows, and in what order.
 *
 * **The priorities** are the `priority:*` labels (`priority.mts`), and
 * "none" for an issue carrying no one of them; an issue is hidden when its
 * priority is switched off. Each can also be picked ("only"): once any is,
 * an issue is shown only when its priority is one picked — the merge
 * order's statuses (`merge-order-view.mts`), for the priorities of issues.
 * A priority is never both, so picking one switches it back on, and
 * switching one off unpicks it. They, `pending` and `in progress` are the
 * part of the view the DAG reads too (`issue-graph.mts`'s
 * `omitFilteredIssues`), so that the two views draw the same issues.
 *
 * **The labels** are every other label an open issue carries, each one a
 * pick: once any is picked, an issue is shown only when it carries one
 * picked, and still not when its priority is switched off. A pick rather
 * than a switch for hiding, because a label is a kind of work, and the
 * question a reader brings to the list is "what bugs are open", not "what
 * is open that is not a bug".
 *
 * **Pending** is the `pending` label, which an author puts on what is held
 * back for now. It is a switch with a pick of its own rather than one of the
 * labels, as the merge order's `pending` is (`merge-order-view.mts`): what a
 * reader wants of it is to leave it out, or to look at it alone. Switched
 * off, an issue carrying it is hidden, whatever else it is; picked, an issue
 * not carrying it is. It is the other side of the priorities, read with them
 * (`issue-filter.mts`): picking both is what is pending of the priorities
 * picked. It too is read by the DAG.
 *
 * **In progress** is the start state `in-progress` (`in-progress.mts`): the
 * issue could be started, and an open pull request closes it or it is
 * labelled `in-progress`. It is
 * a switch with a pick of its own as `pending` is, and a third side read with
 * the other two, since what a reader wants of it is the work under way alone,
 * in the DAG as much as in the list.
 *
 * **The start states** are how each issue stands for being started
 * (`docs/issue-start-after.md`, `pr-report-core`'s `IssueStartState`), read
 * off the issue graph (`issue-start.mts`); each but `in-progress`, which is
 * the switch above, is a switch as a priority is, and an issue none is known
 * for is `free`.
 *
 * **The search** is what the reader types: an issue is shown only when its
 * title holds it, whatever the case, and still not when its priority or its
 * labels leave it out. It narrows the list there and then, so it is not kept
 * in the URL as the rest of the view is: it is held beside the view
 * (`issues-list-store.mts`) rather than in it.
 *
 * Sorted by priority, high comes first and "none" between mid and low, the
 * most recently updated first within each; sorted by start state, what can
 * be started first — ready, then free — then what is planned, what is under way, what wants
 * looking at, and what waits, the most recently updated first within each;
 * otherwise the list is in the order it is read, most recently updated
 * first. Everything is shown, by
 * update, by default.
 *
 * **Kept in the query string** as the merge order's view is
 * (`merge-order-view.mts`), with only what differs from {@link
 * DEFAULT_ISSUES_LIST_VIEW} written: `issues.hidePriority=low.none`,
 * `issues.onlyPriority=high`, `issues.hideStart=blocked.cycle`,
 * `issues.hidePending=1` or `issues.onlyPending=1`, `issues.hideInProgress=1`
 * or `issues.onlyInProgress=1`, `issues.sort=priority`, and a label picked
 * as `issues.label=bug`, once for each, since a label's name can hold the
 * `.` the others are joined with.
 */

import { PENDING_LABEL, type IssueStartState } from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord, StrictExclude, StrictPick } from 'ts-type-forge';
import { isInProgressShown } from './in-progress.mjs';
import {
  DEFAULT_ISSUE_FILTER,
  isIssueFilterShown,
  type IssueFilter,
} from './issue-filter.mjs';
import type { IssueItem } from './load-report.mjs';
import { toggled, type Count } from './merge-order-view.mjs';
import { isPending, isPendingShown } from './pending.mjs';
import {
  isPriorityLabel,
  isPriorityShown,
  PRIORITIES,
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

export type IssueSort = 'updated' | 'priority' | 'start';

/** Every start state, in the order the list sorts and lists them. */
export const ISSUE_STARTS = [
  'ready',
  'free',
  'planned',
  'in-progress',
  'attention',
  'blocked',
  'cycle',
] as const satisfies readonly IssueStartState[];

/**
 * The start states the list switches one by one: every one but
 * `in-progress`, which is the switch both views read (`in-progress.mts`).
 */
export type IssueStartSwitch = StrictExclude<IssueStartState, 'in-progress'>;

export const ISSUE_START_SWITCHES: readonly IssueStartSwitch[] =
  ISSUE_STARTS.filter(
    (start): start is IssueStartSwitch => start !== 'in-progress',
  );

export type IssuesListView = IssueFilter &
  Readonly<{
    /**
     * What is switched off rather than on, as the merge order keeps it, so
     * that the two read alike.
     */
    hiddenStarts: readonly IssueStartSwitch[];
    /** The labels picked, in name order; nothing picked is no narrowing. */
    onlyLabels: readonly string[];
    sort: IssueSort;
  }>;

export const DEFAULT_ISSUES_LIST_VIEW: IssuesListView = {
  ...DEFAULT_ISSUE_FILTER,
  hiddenStarts: [],
  onlyLabels: [],
  sort: 'updated',
} as const;

/** One label's switch, and what it counts. */
export type LabelCount = Readonly<{
  name: string;
  /**
   * GitHub's colour for it, as an open issue carries it; `undefined` for a
   * picked label no open issue carries any more.
   */
  color: string | undefined;
  picked: boolean;
  count: Count;
}>;

/** The counts the list leads with, as the view leaves them. */
export type IssuesListCounts = Readonly<{
  open: Count;
  priorities: ReadonlyRecord<Priority, Count>;
  pending: Count;
  inProgress: Count;
  starts: ReadonlyRecord<IssueStartSwitch, Count>;
  /** In name order; neither the priorities nor `pending`. */
  labels: readonly LabelCount[];
}>;

/**
 * The `open` count, the priorities', `pending`'s and `in progress`'s, for
 * either view.
 */
export type IssueFilterCounts = StrictPick<
  IssuesListCounts,
  'open' | 'priorities' | 'pending' | 'inProgress'
>;

/**
 * How {@link countIssueFilter} reads an item's priority, `pending` and `in
 * progress`.
 */
export type IssueFacts<T> = Readonly<{
  priority: (item: T) => Priority;
  pending: (item: T) => boolean;
  inProgress: (item: T) => boolean;
}>;

/** Each issue's start state, by number; one not in it is `free`. */
export type IssueStarts = ReadonlyMap<number, IssueStartState>;

export const isIssueShown = (
  issue: IssueItem,
  view: IssuesListView,
  query: string = '',
  starts: IssueStarts = NO_STARTS,
): boolean => {
  const start = startOf(starts, issue);

  return (
    isIssueFilterShown(
      {
        priority: priorityOf(issue.labels),
        pending: isPending(issue.labels),
        inProgress: start === 'in-progress',
      },
      view,
    ) &&
    (start === 'in-progress' || !view.hiddenStarts.includes(start)) &&
    (!Arr.isNonEmpty(view.onlyLabels) ||
      issue.labels.some((label) => view.onlyLabels.includes(label.name))) &&
    matchesIssueTitle(issue, query)
  );
};

/**
 * The `open` count, each priority's, `pending`'s and `in progress`'s, of
 * `items` that `passes` lets through whatever their priority and whether or
 * not they are pending or in progress, as {@link countIssues} counts them:
 * `open` as the filter leaves it, and each priority, `pending` and `in
 * progress` as if it were shown, the other sides of the filter as they are.
 * The DAG counts its issues with this (`issues-view-store.mts`), with every
 * one it reads passing.
 */
export const countIssueFilter = <T,>(
  items: readonly T[],
  { priority, pending, inProgress }: IssueFacts<T>,
  passes: (item: T) => boolean,
  filter: IssueFilter,
): IssueFilterCounts => {
  // Each priority reads how many of it the view would show were it shown,
  // whether that is switching it back on or picking it too: an issue has
  // one priority, so under a pick one not picked would otherwise read none.
  const underPriority = (which: Priority): Count => {
    const all = items.filter((item) => priority(item) === which);

    return {
      shown: all.filter(
        (item) =>
          passes(item) &&
          isPendingShown(pending(item), filter) &&
          isInProgressShown(inProgress(item), filter),
      ).length,
      total: all.length,
    } as const;
  };

  const allPending = items.filter(pending);

  const allInProgress = items.filter(inProgress);

  return {
    open: {
      shown: items.filter(
        (item) =>
          passes(item) &&
          isIssueFilterShown(
            {
              priority: priority(item),
              pending: pending(item),
              inProgress: inProgress(item),
            },
            filter,
          ),
      ).length,
      total: items.length,
    },
    priorities: {
      high: underPriority('high'),
      mid: underPriority('mid'),
      low: underPriority('low'),
      none: underPriority('none'),
    },
    pending: {
      shown: allPending.filter(
        (item) =>
          passes(item) &&
          isPriorityShown(priority(item), filter) &&
          isInProgressShown(inProgress(item), filter),
      ).length,
      total: allPending.length,
    },
    inProgress: {
      shown: allInProgress.filter(
        (item) =>
          passes(item) &&
          isPriorityShown(priority(item), filter) &&
          isPendingShown(pending(item), filter),
      ).length,
      total: allInProgress.length,
    },
  } as const;
};

/**
 * Whether the title holds what was typed, whatever the case; the spaces
 * around it are not read, and nothing typed matches everything.
 */
export const matchesIssueTitle = (issue: IssueItem, query: string): boolean => {
  const typed = query.trim().toLowerCase();

  return typed === '' || issue.title.toLowerCase().includes(typed);
};

/** The list as the view and the search show it. */
export const arrangeIssues = (
  items: readonly IssueItem[],
  view: IssuesListView,
  query: string = '',
  starts: IssueStarts = NO_STARTS,
): readonly IssueItem[] => {
  const shown = items.filter((issue) =>
    isIssueShown(issue, view, query, starts),
  );

  // `toSorted` is stable, so each rank keeps the order it was read in.
  switch (view.sort) {
    case 'priority':
      return shown.toSorted(
        (a, b) =>
          PRIORITY_RANK[priorityOf(a.labels)] -
          PRIORITY_RANK[priorityOf(b.labels)],
      );

    case 'start':
      return shown.toSorted(
        (a, b) =>
          ISSUE_STARTS.indexOf(startOf(starts, a)) -
          ISSUE_STARTS.indexOf(startOf(starts, b)),
      );

    case 'updated':
      return shown;
  }
};

/**
 * What each count reads: how many the list shows, of how many are open.
 *
 * As the merge order counts (`countView`), each switch is counted with
 * itself on and every other as it is: a priority switched off reads how many
 * showing it would show (switching it back on, or picking it too while
 * another is picked), `pending` and `in progress` likewise, and a label how
 * many picking it would add — which, picked or not, is every issue carrying
 * it that the priorities, `pending` and `in progress` show. The search
 * narrows what each shows, never its whole: the whole is what is open, so
 * that the counts say how much the search leaves out.
 */
export const countIssues = (
  items: readonly IssueItem[],
  view: IssuesListView,
  query: string = '',
  starts: IssueStarts = NO_STARTS,
): IssuesListCounts => {
  const underStart = (which: IssueStartSwitch): Count =>
    countUnder(
      items,
      (issue) => startOf(starts, issue) === which,
      {
        ...view,
        hiddenStarts: view.hiddenStarts.filter((each) => each !== which),
      },
      query,
      starts,
    );

  const colors = new Map(
    items
      .flatMap(({ labels }) => labels)
      .filter(
        (label) => !isPriorityLabel(label.name) && label.name !== PENDING_LABEL,
      )
      .map((label) => [label.name, label.color]),
  );

  const names = Arr.uniq([...colors.keys(), ...view.onlyLabels]).toSorted(
    (a, b) => a.localeCompare(b),
  );

  const unfiltered: IssuesListView = {
    ...view,
    ...DEFAULT_ISSUE_FILTER,
  } as const;

  return {
    ...countIssueFilter(
      items,
      {
        priority: (issue) => priorityOf(issue.labels),
        pending: (issue) => isPending(issue.labels),
        inProgress: (issue) => startOf(starts, issue) === 'in-progress',
      },
      (issue) => isIssueShown(issue, unfiltered, query, starts),
      view,
    ),
    starts: {
      ready: underStart('ready'),
      free: underStart('free'),
      planned: underStart('planned'),
      attention: underStart('attention'),
      blocked: underStart('blocked'),
      cycle: underStart('cycle'),
    },
    labels: names.map((labelName) => ({
      name: labelName,
      color: colors.get(labelName),
      picked: view.onlyLabels.includes(labelName),
      count: countUnder(
        items,
        (issue) => issue.labels.some((label) => label.name === labelName),
        { ...view, onlyLabels: [] },
        query,
        starts,
      ),
    })),
  } as const;
};

/**
 * Hides the priority when it is shown, and shows it when it is not: switched
 * back on, and picked too while another is, since an issue has one priority
 * and one not picked would otherwise still show nothing.
 */
export const toggleIssuePriority = (
  view: IssuesListView,
  priority: Priority,
): IssuesListView =>
  isPriorityShown(priority, view)
    ? ({
        ...view,
        hiddenPriorities: toggled(PRIORITIES, view.hiddenPriorities, priority),
        onlyPriorities: view.onlyPriorities.filter((each) => each !== priority),
      } as const)
    : ({
        ...view,
        hiddenPriorities: view.hiddenPriorities.filter(
          (each) => each !== priority,
        ),
        onlyPriorities: Arr.isNonEmpty(view.onlyPriorities)
          ? toggled<Priority>(PRIORITIES, view.onlyPriorities, priority)
          : view.onlyPriorities,
      } as const);

export const toggleIssuePriorityOnly = (
  view: IssuesListView,
  priority: Priority,
): IssuesListView =>
  ({
    ...view,
    hiddenPriorities: view.hiddenPriorities.filter((each) => each !== priority),
    onlyPriorities: toggled(PRIORITIES, view.onlyPriorities, priority),
  }) as const;

export const toggleIssueStart = (
  view: IssuesListView,
  start: IssueStartSwitch,
): IssuesListView =>
  ({
    ...view,
    hiddenStarts: toggled(ISSUE_START_SWITCHES, view.hiddenStarts, start),
  }) as const;

export const toggleLabel = (
  view: IssuesListView,
  labelName: string,
): IssuesListView =>
  ({
    ...view,
    onlyLabels: view.onlyLabels.includes(labelName)
      ? view.onlyLabels.filter((each) => each !== labelName)
      : Arr.toPushed(view.onlyLabels, labelName).toSorted((a, b) =>
          a.localeCompare(b),
        ),
  }) as const;

/** Hides what is pending when it is shown, unpicking it, and shows it again. */
export const toggleIssuePending = (view: IssuesListView): IssuesListView =>
  ({ ...view, hidePending: !view.hidePending, onlyPending: false }) as const;

/** Picks what is pending, switching it back on, or unpicks it. */
export const toggleIssuePendingOnly = (view: IssuesListView): IssuesListView =>
  ({ ...view, hidePending: false, onlyPending: !view.onlyPending }) as const;

/**
 * Hides what is in progress when it is shown, unpicking it, and shows it
 * again.
 */
export const toggleIssueInProgress = (view: IssuesListView): IssuesListView =>
  ({
    ...view,
    hideInProgress: !view.hideInProgress,
    onlyInProgress: false,
  }) as const;

/** Picks what is in progress, switching it back on, or unpicks it. */
export const toggleIssueInProgressOnly = (
  view: IssuesListView,
): IssuesListView =>
  ({
    ...view,
    hideInProgress: false,
    onlyInProgress: !view.onlyInProgress,
  }) as const;

export const withIssueSort = (
  view: IssuesListView,
  sort: IssueSort,
): IssuesListView => ({ ...view, sort }) as const;

/**
 * The view the query string asks for. A priority, or `pending`, both
 * switched off and picked, which only a hand can write, is switched off.
 * A `dag.hidePending=1` an older page wrote switches `pending` off, unless
 * `issues.onlyPending` picks it, and an `issues.hideStart=in-progress`
 * switches `in progress` off, unless `issues.onlyInProgress` picks it.
 */
export const issuesListViewFromSearch = (search: string): IssuesListView => {
  const params = new URLSearchParams(search);

  const sort = params.get(PARAM.sort);

  const hiddenPriorities = namesParam(
    PRIORITIES,
    params.getAll(PARAM.hidePriority),
  );

  const onlyPending = flagParam(params, PARAM.onlyPending);

  // The DAG's own switch an older page wrote, now the one both views read,
  // unless the issues' own parameters say otherwise.
  const hidePending =
    flagParam(params, PARAM.hidePending) ||
    (!onlyPending && flagParam(params, DAG_HIDE_PENDING));

  const onlyInProgress = flagParam(params, PARAM.onlyInProgress);

  // The start state's own switch an older page wrote, now the one both
  // views read.
  const hideInProgress =
    flagParam(params, PARAM.hideInProgress) ||
    (!onlyInProgress &&
      Arr.isNonEmpty(
        namesParam(['in-progress'], params.getAll(PARAM.hideStart)),
      ));

  return {
    hiddenPriorities,
    onlyPriorities: namesParam(
      PRIORITIES,
      params.getAll(PARAM.onlyPriority),
    ).filter((each) => !hiddenPriorities.includes(each)),
    hiddenStarts: namesParam(
      ISSUE_START_SWITCHES,
      params.getAll(PARAM.hideStart),
    ),
    // The priorities and `pending` are not labels to pick here: they have
    // parameters of their own.
    onlyLabels: Arr.uniq(
      params
        .getAll(PARAM.label)
        .filter(
          (labelName) =>
            labelName !== '' &&
            labelName !== PENDING_LABEL &&
            !isPriorityLabel(labelName),
        ),
    ).toSorted((a, b) => a.localeCompare(b)),
    hidePending,
    onlyPending: !hidePending && onlyPending,
    hideInProgress,
    onlyInProgress: !hideInProgress && onlyInProgress,
    sort: sort === 'priority' || sort === 'start' ? sort : 'updated',
  };
};

/** The query string with `view` written in, the rest as it was. */
export const searchWithIssuesListView = (
  search: string,
  view: IssuesListView,
): string => {
  const params = new URLSearchParams(search);

  setNamesParam(params, PARAM.hidePriority, view.hiddenPriorities);

  setNamesParam(params, PARAM.onlyPriority, view.onlyPriorities);

  setNamesParam(params, PARAM.hideStart, view.hiddenStarts);

  // Rewritten only when they changed, since writing them again moves them
  // to the end of the query.
  if (!Arr.eq(params.getAll(PARAM.label), view.onlyLabels)) {
    params.delete(PARAM.label);

    for (const labelName of view.onlyLabels) {
      params.append(PARAM.label, labelName);
    }
  }

  setFlagParam(params, PARAM.hidePending, view.hidePending);

  setFlagParam(params, PARAM.onlyPending, view.onlyPending);

  setFlagParam(params, PARAM.hideInProgress, view.hideInProgress);

  setFlagParam(params, PARAM.onlyInProgress, view.onlyInProgress);

  if (view.sort === 'updated') {
    params.delete(PARAM.sort);
  } else {
    params.set(PARAM.sort, view.sort);
  }

  return searchOf(params);
};

/** What the query string asks for, now. */
export const issuesListViewFromLocation = (): IssuesListView =>
  issuesListViewFromSearch(currentSearch());

/** Writes the view into the address bar; see `rewriteSearch`. */
export const saveIssuesListView = (view: IssuesListView): void => {
  rewriteSearch((search) => searchWithIssuesListView(search, view));
};

const countUnder = (
  items: readonly IssueItem[],
  under: (issue: IssueItem) => boolean,
  view: IssuesListView,
  query: string,
  starts: IssueStarts,
): Count => {
  const all = items.filter(under);

  return {
    shown: all.filter((issue) => isIssueShown(issue, view, query, starts))
      .length,
    total: all.length,
  } as const;
};

const PARAM = {
  hidePriority: 'issues.hidePriority',
  onlyPriority: 'issues.onlyPriority',
  hideStart: 'issues.hideStart',
  label: 'issues.label',
  hidePending: 'issues.hidePending',
  onlyPending: 'issues.onlyPending',
  hideInProgress: 'issues.hideInProgress',
  onlyInProgress: 'issues.onlyInProgress',
  sort: 'issues.sort',
} as const;

/**
 * What an older page wrote for the DAG's own switch for what is pending,
 * read as `issues.hidePending`; `issues-view-settings.mts` drops it.
 */
const DAG_HIDE_PENDING = 'dag.hidePending';

const NO_STARTS: IssueStarts = new Map<number, IssueStartState>();

const startOf = (starts: IssueStarts, issue: IssueItem): IssueStartState =>
  starts.get(issue.number) ?? 'free';
