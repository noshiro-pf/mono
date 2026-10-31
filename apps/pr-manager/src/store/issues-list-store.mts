/**
 * Which open issues the list shows, and the list that leaves.
 *
 * What a choice does is `issues-list-view.mts`; this holds the current one
 * and derives from it, with the open issues, what the list draws. It starts
 * as `initial`, which the page reads off the query string as it opens
 * (`issues-list-view.mts`), and every change is handed to `save` from
 * `start` on, as the merge order's is (`merge-order-store.mts`).
 *
 * The search is held beside the view, not in it, and so is never saved: it
 * starts empty on every visit.
 *
 * The priorities, `pending` and `in progress` in the view are the DAG's too
 * (`issues-view-store.mts`): switched off or picked here, they are for either
 * view.
 */

import {
  combine,
  createState,
  map,
  skipIfNoChange,
  type InitializedObservable,
} from 'synstate';
import { fastDeepEqual } from 'ts-data-forge';
import type { IssueFilter } from '../issue-filter.mjs';
import {
  issueStartsOf,
  type IssueGraph,
  type IssueStart,
} from '../issue-graph.mjs';
import {
  arrangeIssues,
  countIssues,
  toggleIssueInProgress,
  toggleIssueInProgressOnly,
  toggleIssuePending,
  toggleIssuePendingOnly,
  toggleIssuePriority,
  toggleIssuePriorityOnly,
  toggleIssueStart,
  toggleLabel,
  withIssueSort,
  type IssuesListCounts,
  type IssuesListView,
  type IssueSort,
  type IssueStartSwitch,
} from '../issues-list-view.mjs';
import type { IssueItem, LoadedReport } from '../load-report.mjs';
import type { Priority } from '../priority.mjs';

export type IssuesListDeps = Readonly<{
  issues: InitializedObservable<LoadedReport['issues']>;
  /**
   * The issues' graph, what is done included (`createIssueGraph`), which
   * each issue's start state is read off.
   */
  graph: InitializedObservable<IssueGraph>;
  initial: IssuesListView;
  save: (view: IssuesListView) => void;
}>;

export type IssuesListStore = Readonly<{
  view: InitializedObservable<IssuesListView>;
  /**
   * The priorities, `pending` and `in progress` of the view alone, which the
   * DAG reads (`issues-view-store.mts`); passed on only when they changed, so
   * that a change to the rest of the view derives nothing there.
   */
  filter: InitializedObservable<IssueFilter>;
  /** What the reader typed to search the titles by; empty is no search. */
  query: InitializedObservable<string>;
  /**
   * The open issues with what the view and the search hide taken out, in
   * the view's order.
   */
  items: InitializedObservable<readonly IssueItem[]>;
  /** What the priorities and the labels read, as the view leaves them. */
  counts: InitializedObservable<IssuesListCounts>;
  /** How each listed issue stands for being started, by number. */
  starts: InitializedObservable<ReadonlyMap<number, IssueStart>>;
  togglePriority: (priority: Priority) => void;
  togglePriorityOnly: (priority: Priority) => void;
  toggleStart: (which: IssueStartSwitch) => void;
  toggleLabel: (labelName: string) => void;
  togglePending: () => void;
  togglePendingOnly: () => void;
  toggleInProgress: () => void;
  toggleInProgressOnly: () => void;
  setSort: (sort: IssueSort) => void;
  setQuery: (query: string) => void;
  /** Saves every change from now on; returns what stops it. */
  start: () => () => void;
}>;

export const createIssuesListStore = (
  deps: IssuesListDeps,
): IssuesListStore => {
  const [view, , { updateState: updateView }] = createState<IssuesListView>(
    deps.initial,
  );

  const [query, setQuery] = createState<string>('');

  const start = (): (() => void) => {
    const saving = view.subscribe(deps.save);

    return () => {
      saving.unsubscribe();
    };
  };

  const starts = combine([deps.graph, deps.issues])
    .pipe(map(([graph, issues]) => issueStartsOf(graph, issues.items)))
    .pipe(skipIfNoChange(fastDeepEqual));

  const startStates = starts.pipe(
    map(
      (each) =>
        new Map(Array.from(each, ([number, { state }]) => [number, state])),
    ),
  );

  return {
    view,
    filter: view
      .pipe(
        map(
          ({
            hiddenPriorities,
            onlyPriorities,
            hidePending,
            onlyPending,
            hideInProgress,
            onlyInProgress,
          }): IssueFilter => ({
            hiddenPriorities,
            onlyPriorities,
            hidePending,
            onlyPending,
            hideInProgress,
            onlyInProgress,
          }),
        ),
      )
      .pipe(skipIfNoChange(fastDeepEqual)),
    query,
    // Passed on only when it changed: a poll that moved nothing of the
    // issues lays nothing out again.
    items: combine([deps.issues, view, query, startStates])
      .pipe(
        map(([issues, current, typed, states]) =>
          arrangeIssues(issues.items, current, typed, states),
        ),
      )
      .pipe(skipIfNoChange(fastDeepEqual)),
    counts: combine([deps.issues, view, query, startStates])
      .pipe(
        map(([issues, current, typed, states]) =>
          countIssues(issues.items, current, typed, states),
        ),
      )
      .pipe(skipIfNoChange(fastDeepEqual)),
    starts,
    togglePriority: (priority) => {
      updateView((current) => toggleIssuePriority(current, priority));
    },
    togglePriorityOnly: (priority) => {
      updateView((current) => toggleIssuePriorityOnly(current, priority));
    },
    toggleStart: (which) => {
      updateView((current) => toggleIssueStart(current, which));
    },
    toggleLabel: (labelName) => {
      updateView((current) => toggleLabel(current, labelName));
    },
    togglePending: () => {
      updateView(toggleIssuePending);
    },
    togglePendingOnly: () => {
      updateView(toggleIssuePendingOnly);
    },
    toggleInProgress: () => {
      updateView(toggleIssueInProgress);
    },
    toggleInProgressOnly: () => {
      updateView(toggleIssueInProgressOnly);
    },
    setSort: (sort) => {
      updateView((current) => withIssueSort(current, sort));
    },
    setQuery,
    start,
  };
};
