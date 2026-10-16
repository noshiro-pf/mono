/**
 * Which open issues the list shows, and the list that leaves.
 *
 * What a choice does is `issues-list-view.mts`; this holds the current one
 * and derives from it, with the open issues, what the list draws. It is
 * kept as the merge order's is (`merge-order-store.mts`), and for the same
 * reasons: it starts as everything shown, by update, until `load` answers
 * with what was saved; only then is anything handed to `save`, so the
 * default never overwrites a saved choice; and a choice the reader made in
 * that moment is kept over the saved one.
 */

import {
  combine,
  createState,
  map,
  skipIfNoChange,
  type InitializedObservable,
  type Subscription,
} from 'synstate';
import { fastDeepEqual } from 'ts-data-forge';
import {
  arrangeIssues,
  countIssues,
  DEFAULT_ISSUES_LIST_VIEW,
  parseIssuesListView,
  toggleIssuePriority,
  toggleLabel,
  withIssueSort,
  type IssuesListCounts,
  type IssuesListView,
  type IssueSort,
} from '../issues-list-view.mjs';
import type { IssueItem, LoadedReport } from '../load-report.mjs';
import type { Priority } from '../priority.mjs';

export type IssuesListDeps = Readonly<{
  issues: InitializedObservable<LoadedReport['issues']>;
  /** What was saved, as it was saved; it rejects when nothing can be read. */
  load: () => Promise<unknown>;
  save: (view: IssuesListView) => void;
}>;

export type IssuesListStore = Readonly<{
  view: InitializedObservable<IssuesListView>;
  /** The open issues with what the view hides taken out, in its order. */
  items: InitializedObservable<readonly IssueItem[]>;
  /** What the priorities and the labels read, as the view leaves them. */
  counts: InitializedObservable<IssuesListCounts>;
  togglePriority: (priority: Priority) => void;
  toggleLabel: (labelName: string) => void;
  setSort: (sort: IssueSort) => void;
  /** Reads what was saved, then saves every change; returns what stops it. */
  start: () => () => void;
}>;

export const createIssuesListStore = (
  deps: IssuesListDeps,
): IssuesListStore => {
  const [view, setView, { updateState: updateView }] =
    createState<IssuesListView>(DEFAULT_ISSUES_LIST_VIEW);

  // Whether the reader has chosen anything yet.
  const mut_reader = { changed: false };

  const change = (next: (current: IssuesListView) => IssuesListView): void => {
    mut_reader.changed = true;

    updateView(next);
  };

  const start = (): (() => void) => {
    const mut_run: { stopped: boolean; saving: Subscription | undefined } = {
      stopped: false,
      saving: undefined,
    };

    const resume = (stored: unknown): void => {
      if (mut_run.stopped) {
        return;
      }

      if (!mut_reader.changed) {
        setView(parseIssuesListView(stored));
      }

      mut_run.saving = view.subscribe(deps.save);
    };

    deps
      .load()
      .catch(() => undefined)
      .then(resume)
      .catch(() => undefined);

    return () => {
      mut_run.stopped = true;

      mut_run.saving?.unsubscribe();
    };
  };

  return {
    view,
    // Passed on only when it changed: a poll that moved nothing of the
    // issues lays nothing out again.
    items: combine([deps.issues, view])
      .pipe(map(([issues, current]) => arrangeIssues(issues.items, current)))
      .pipe(skipIfNoChange(fastDeepEqual)),
    counts: combine([deps.issues, view])
      .pipe(map(([issues, current]) => countIssues(issues.items, current)))
      .pipe(skipIfNoChange(fastDeepEqual)),
    togglePriority: (priority) => {
      change((current) => toggleIssuePriority(current, priority));
    },
    toggleLabel: (labelName) => {
      change((current) => toggleLabel(current, labelName));
    },
    setSort: (sort) => {
      change((current) => withIssueSort(current, sort));
    },
    start,
  };
};
