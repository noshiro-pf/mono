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
 * Sorted by priority, high comes first and "none" between mid and low, the
 * most recently updated first within each; otherwise the list is in the
 * order it is read, most recently updated first. Everything is shown, by
 * update, by default; what the reader changes is kept (`settings-db.mts`).
 */

import { Arr, hasKey, isRecord, isString } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { IssueItem } from './load-report.mjs';
import { known, toggled, type Count } from './merge-order-view.mjs';
import {
  isPriorityLabel,
  PRIORITIES,
  PRIORITY_RANK,
  priorityOf,
  type Priority,
} from './priority.mjs';

export type IssueSort = 'updated' | 'priority';

export type IssuesListView = Readonly<{
  /**
   * What is switched off rather than on, as the merge order keeps it, so
   * that the two read alike.
   */
  hiddenPriorities: readonly Priority[];
  /** The labels picked, in name order; nothing picked is no narrowing. */
  onlyLabels: readonly string[];
  sort: IssueSort;
}>;

export const DEFAULT_ISSUES_LIST_VIEW: IssuesListView = {
  hiddenPriorities: [],
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
  /** In name order. */
  labels: readonly LabelCount[];
}>;

export const isIssueShown = (issue: IssueItem, view: IssuesListView): boolean =>
  !view.hiddenPriorities.includes(priorityOf(issue.labels)) &&
  (!Arr.isNonEmpty(view.onlyLabels) ||
    issue.labels.some((label) => view.onlyLabels.includes(label.name)));

/** The list as the view shows it. */
export const arrangeIssues = (
  items: readonly IssueItem[],
  view: IssuesListView,
): readonly IssueItem[] => {
  const shown = items.filter((issue) => isIssueShown(issue, view));

  // `toSorted` is stable, so each priority keeps the order it was read in.
  return view.sort === 'priority'
    ? shown.toSorted(
        (a, b) =>
          PRIORITY_RANK[priorityOf(a.labels)] -
          PRIORITY_RANK[priorityOf(b.labels)],
      )
    : shown;
};

/**
 * What each count reads: how many the list shows, of how many are open.
 *
 * As the merge order counts (`countView`), each switch is counted with
 * itself on and every other as it is: a priority switched off reads how many
 * switching it back on would show, and a label how many picking it would
 * add — which, picked or not, is every issue carrying it whose priority is
 * shown.
 */
export const countIssues = (
  items: readonly IssueItem[],
  view: IssuesListView,
): IssuesListCounts => {
  const underPriority = (which: Priority): Count =>
    countUnder(items, (issue) => priorityOf(issue.labels) === which, {
      ...view,
      hiddenPriorities: view.hiddenPriorities.filter((each) => each !== which),
    });

  const colors = new Map(
    items
      .flatMap(({ labels }) => labels)
      .filter((label) => !isPriorityLabel(label.name))
      .map((label) => [label.name, label.color]),
  );

  const names = Arr.uniq([...colors.keys(), ...view.onlyLabels]).toSorted(
    (a, b) => a.localeCompare(b),
  );

  return {
    open: countUnder(items, () => true, view),
    priorities: {
      high: underPriority('high'),
      mid: underPriority('mid'),
      low: underPriority('low'),
      none: underPriority('none'),
    },
    labels: names.map((labelName) => ({
      name: labelName,
      color: colors.get(labelName),
      picked: view.onlyLabels.includes(labelName),
      count: countUnder(
        items,
        (issue) => issue.labels.some((label) => label.name === labelName),
        { ...view, onlyLabels: [] },
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

export const withIssueSort = (
  view: IssuesListView,
  sort: IssueSort,
): IssuesListView => ({ ...view, sort }) as const;

/**
 * What was saved, read forgivingly: anything it cannot make sense of is the
 * default, and a priority it does not know is dropped, so a choice saved by
 * an older page still opens. A label is any name: one no open issue carries
 * is still listed, picked, for the reader to unpick.
 */
export const parseIssuesListView = (stored: unknown): IssuesListView => {
  if (!isRecord(stored)) {
    return DEFAULT_ISSUES_LIST_VIEW;
  }

  const onlyLabels = hasKey(stored, 'onlyLabels')
    ? stored.onlyLabels
    : ([] as const);

  return {
    hiddenPriorities: known(
      PRIORITIES,
      hasKey(stored, 'hiddenPriorities') ? stored.hiddenPriorities : undefined,
    ),
    onlyLabels: Arr.isArray(onlyLabels)
      ? Arr.uniq(onlyLabels.filter(isString)).toSorted((a, b) =>
          a.localeCompare(b),
        )
      : [],
    sort:
      hasKey(stored, 'sort') && stored.sort === 'priority'
        ? 'priority'
        : 'updated',
  };
};

const countUnder = (
  items: readonly IssueItem[],
  under: (issue: IssueItem) => boolean,
  view: IssuesListView,
): Count => {
  const all = items.filter(under);

  return {
    shown: all.filter((issue) => isIssueShown(issue, view)).length,
    total: all.length,
  } as const;
};
