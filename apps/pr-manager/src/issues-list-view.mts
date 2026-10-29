/**
 * Which open issues the list shows, and in what order.
 *
 * **The priorities** are the `priority:*` labels (`priority.mts`), and
 * "none" for an issue carrying no one of them; an issue is hidden when its
 * priority is switched off — the merge order's priority switches
 * (`merge-order-view.mts`), for issues.
 *
 * **The labels** are every other label an open issue carries, each one a
 * pick: once any is picked, an issue is shown only when it carries one
 * picked, and still not when its priority is switched off. A pick rather
 * than a switch for hiding, because a label is a kind of work, and the
 * question a reader brings to the list is "what bugs are open", not "what
 * is open that is not a bug".
 *
 * **Pending** is the `pending` label, which an author puts on what is held
 * back for now. It is a switch rather than one of the labels, as the merge
 * order's `pending` is (`merge-order-view.mts`): what a reader wants of it is
 * to leave it out. Switched off, an issue carrying it is hidden, whatever
 * else it is.
 *
 * **The start states** are how each issue stands for being started
 * (`docs/issue-start-after.md`, `pr-report-core`'s `IssueStartState`), read
 * off the issue graph (`issue-start.mts`); each is a switch as a priority is,
 * and an issue none is known for is `free`.
 *
 * **The search** is what the reader types: an issue is shown only when its
 * title holds it, whatever the case, and still not when its priority or its
 * labels leave it out. It narrows the list there and then, so it is not kept
 * in the URL as the rest of the view is: it is held beside the view
 * (`issues-list-store.mts`) rather than in it.
 *
 * Sorted by priority, high comes first and "none" between mid and low, the
 * most recently updated first within each; sorted by start state, what can
 * be started first — ready, then free — then what is under way, what wants
 * looking at, and what waits, the most recently updated first within each;
 * otherwise the list is in the order it is read, most recently updated
 * first. Everything is shown, by
 * update, by default.
 *
 * **Kept in the query string** as the merge order's view is
 * (`merge-order-view.mts`), with only what differs from
 * {@link DEFAULT_ISSUES_LIST_VIEW} written: `issues.hidePriority=low.none`,
 * `issues.hideStart=blocked.cycle`, `issues.hidePending=1`,
 * `issues.sort=priority`, and a label picked as `issues.label=bug`, once
 * for each, since a label's name can hold the `.` the others are joined
 * with.
 */

import { PENDING_LABEL, type IssueStartState } from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { IssueItem } from './load-report.mjs';
import { toggled, type Count } from './merge-order-view.mjs';
import { isPending } from './pending.mjs';
import {
  isPriorityLabel,
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
  'in-progress',
  'attention',
  'blocked',
  'cycle',
] as const satisfies readonly IssueStartState[];

export type IssuesListView = Readonly<{
  /**
   * What is switched off rather than on, as the merge order keeps it, so
   * that the two read alike.
   */
  hiddenPriorities: readonly Priority[];
  /** Switched off, likewise. */
  hiddenStarts: readonly IssueStartState[];
  /** The labels picked, in name order; nothing picked is no narrowing. */
  onlyLabels: readonly string[];
  /** Whether what is labelled `pending` is left out. */
  hidePending: boolean;
  sort: IssueSort;
}>;

export const DEFAULT_ISSUES_LIST_VIEW: IssuesListView = {
  hiddenPriorities: [],
  hiddenStarts: [],
  onlyLabels: [],
  hidePending: false,
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
  starts: ReadonlyRecord<IssueStartState, Count>;
  /** In name order; neither the priorities nor `pending`. */
  labels: readonly LabelCount[];
}>;

/** Each issue's start state, by number; one not in it is `free`. */
export type IssueStarts = ReadonlyMap<number, IssueStartState>;

export const isIssueShown = (
  issue: IssueItem,
  view: IssuesListView,
  query: string = '',
  starts: IssueStarts = NO_STARTS,
): boolean =>
  !view.hiddenPriorities.includes(priorityOf(issue.labels)) &&
  !(view.hidePending && isPending(issue.labels)) &&
  !view.hiddenStarts.includes(startOf(starts, issue)) &&
  (!Arr.isNonEmpty(view.onlyLabels) ||
    issue.labels.some((label) => view.onlyLabels.includes(label.name))) &&
  matchesIssueTitle(issue, query);

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
 * switching it back on would show, and a label how many picking it would
 * add — which, picked or not, is every issue carrying it whose priority is
 * shown. The search narrows what each shows, never its whole: the whole is
 * what is open, so that the counts say how much the search leaves out.
 */
export const countIssues = (
  items: readonly IssueItem[],
  view: IssuesListView,
  query: string = '',
  starts: IssueStarts = NO_STARTS,
): IssuesListCounts => {
  const underPriority = (which: Priority): Count =>
    countUnder(
      items,
      (issue) => priorityOf(issue.labels) === which,
      {
        ...view,
        hiddenPriorities: view.hiddenPriorities.filter(
          (each) => each !== which,
        ),
      },
      query,
      starts,
    );

  const underStart = (which: IssueStartState): Count =>
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

  return {
    open: countUnder(items, () => true, view, query, starts),
    priorities: {
      high: underPriority('high'),
      mid: underPriority('mid'),
      low: underPriority('low'),
      none: underPriority('none'),
    },
    pending: countUnder(
      items,
      (issue) => isPending(issue.labels),
      { ...view, hidePending: false },
      query,
      starts,
    ),
    starts: {
      ready: underStart('ready'),
      free: underStart('free'),
      'in-progress': underStart('in-progress'),
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

export const toggleIssuePriority = (
  view: IssuesListView,
  priority: Priority,
): IssuesListView =>
  ({
    ...view,
    hiddenPriorities: toggled(PRIORITIES, view.hiddenPriorities, priority),
  }) as const;

export const toggleIssueStart = (
  view: IssuesListView,
  start: IssueStartState,
): IssuesListView =>
  ({
    ...view,
    hiddenStarts: toggled(ISSUE_STARTS, view.hiddenStarts, start),
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

export const togglePendingIssues = (view: IssuesListView): IssuesListView =>
  ({ ...view, hidePending: !view.hidePending }) as const;

export const withIssueSort = (
  view: IssuesListView,
  sort: IssueSort,
): IssuesListView => ({ ...view, sort }) as const;

/** The view the query string asks for. */
export const issuesListViewFromSearch = (search: string): IssuesListView => {
  const params = new URLSearchParams(search);

  const sort = params.get(PARAM.sort);

  return {
    hiddenPriorities: namesParam(PRIORITIES, params.getAll(PARAM.hidePriority)),
    hiddenStarts: namesParam(ISSUE_STARTS, params.getAll(PARAM.hideStart)),
    // The list offers no pick of the priorities or `pending`, which are
    // switches of their own.
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
    hidePending: flagParam(params, PARAM.hidePending),
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
  hideStart: 'issues.hideStart',
  label: 'issues.label',
  hidePending: 'issues.hidePending',
  sort: 'issues.sort',
} as const;

const NO_STARTS: IssueStarts = new Map<number, IssueStartState>();

const startOf = (starts: IssueStarts, issue: IssueItem): IssueStartState =>
  starts.get(issue.number) ?? 'free';
