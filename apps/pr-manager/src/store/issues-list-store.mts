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
 *
 * The search is held beside the view, not in it, and so is never saved: it
 * starts empty on every visit.
 */

import type { IssueStartState } from 'pr-report-core';
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
  issueStartsOf,
  type IssueGraph,
  type IssueStart,
} from '../issue-graph.mjs';
import {
  arrangeIssues,
  countIssues,
  DEFAULT_ISSUES_LIST_VIEW,
  parseIssuesListView,
  toggleIssuePriority,
  toggleIssueStart,
  toggleLabel,
  togglePendingIssues,
  withIssueSort,
  type IssuesListCounts,
  type IssuesListView,
  type IssueSort,
} from '../issues-list-view.mjs';
import type { IssueItem, LoadedReport } from '../load-report.mjs';
import type { Priority } from '../priority.mjs';

export type IssuesListDeps = Readonly<{
  issues: InitializedObservable<LoadedReport['issues']>;
  /**
   * The issues' graph, what is done included (`issues-view-store.mts`), which
   * each issue's start state is read off.
   */
  graph: InitializedObservable<IssueGraph>;
  /** What was saved, as it was saved; it rejects when nothing can be read. */
  load: () => Promise<unknown>;
  save: (view: IssuesListView) => void;
}>;

export type IssuesListStore = Readonly<{
  view: InitializedObservable<IssuesListView>;
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
  toggleStart: (which: IssueStartState) => void;
  toggleLabel: (labelName: string) => void;
  togglePending: () => void;
  setSort: (sort: IssueSort) => void;
  setQuery: (query: string) => void;
  /** Reads what was saved, then saves every change; returns what stops it. */
  start: () => () => void;
}>;

export const createIssuesListStore = (
  deps: IssuesListDeps,
): IssuesListStore => {
  const [view, setView, { updateState: updateView }] =
    createState<IssuesListView>(DEFAULT_ISSUES_LIST_VIEW);

  const [query, setQuery] = createState<string>('');

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
      change((current) => toggleIssuePriority(current, priority));
    },
    toggleStart: (which) => {
      change((current) => toggleIssueStart(current, which));
    },
    toggleLabel: (labelName) => {
      change((current) => toggleLabel(current, labelName));
    },
    togglePending: () => {
      change(togglePendingIssues);
    },
    setSort: (sort) => {
      change((current) => withIssueSort(current, sort));
    },
    setQuery,
    start,
  };
};
