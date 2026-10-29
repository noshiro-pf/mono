/**
 * Which pull requests the merge order shows, and the tree that leaves.
 *
 * What a choice does is `merge-order-view.mts`; this holds the current one
 * and derives from it, with the report, what the merge order draws.
 *
 * The choice starts as `initial`, which the page reads off the query string
 * as it opens (`merge-order-view.mts`), and every change is handed to `save`
 * from `start` on.
 */

import {
  combine,
  createState,
  map,
  skipIfNoChange,
  type InitializedObservable,
} from 'synstate';
import { fastDeepEqual } from 'ts-data-forge';
import type { Entry, LoadedReport } from '../load-report.mjs';
import {
  arrangeMergeOrder,
  countView,
  statusFiltersOf,
  toggleOnly,
  togglePriority,
  toggleStatus,
  withAvailable,
  withSort,
  type MergeOrderCounts,
  type MergeOrderSort,
  type MergeOrderView,
  type StatusFilter,
} from '../merge-order-view.mjs';
import type { Priority } from '../priority.mjs';

export type MergeOrderDeps = Readonly<{
  entries: InitializedObservable<readonly Entry[]>;
  roots: InitializedObservable<LoadedReport['roots']>;
  /** Which statuses are on offer (`statusFiltersOf`). */
  features: InitializedObservable<LoadedReport['features']>;
  initial: MergeOrderView;
  save: (view: MergeOrderView) => void;
}>;

export type MergeOrderStore = Readonly<{
  view: InitializedObservable<MergeOrderView>;
  /** The merge order with what the view hides taken out, in its order. */
  roots: InitializedObservable<LoadedReport['roots']>;
  /** What the counts and the priorities read, as the view leaves them. */
  counts: InitializedObservable<MergeOrderCounts>;
  toggleStatus: (filter: StatusFilter) => void;
  toggleOnly: (filter: StatusFilter) => void;
  togglePriority: (priority: Priority) => void;
  setSort: (sort: MergeOrderSort) => void;
  /** Saves every change from now on; returns what stops it. */
  start: () => () => void;
}>;

export const createMergeOrderStore = (
  deps: MergeOrderDeps,
): MergeOrderStore => {
  const [view, , { updateState: updateView }] = createState<MergeOrderView>(
    deps.initial,
  );

  const start = (): (() => void) => {
    const saving = view.subscribe(deps.save);

    return () => {
      saving.unsubscribe();
    };
  };

  // The view as it applies to this repository; `view` is what is kept.
  const applied = combine([view, deps.features]).pipe(
    map(([current, features]) =>
      withAvailable(current, statusFiltersOf(features)),
    ),
  );

  return {
    view,
    // Passed on only when it changed, as the reader's parts are: a pull
    // request whose checks moved changes the entries, not the tree.
    roots: combine([deps.roots, deps.entries, applied])
      .pipe(
        map(([roots, entries, current]) =>
          arrangeMergeOrder(roots, entries, current),
        ),
      )
      .pipe(skipIfNoChange(fastDeepEqual)),
    counts: combine([deps.entries, applied])
      .pipe(map(([entries, current]) => countView(entries, current)))
      .pipe(skipIfNoChange(fastDeepEqual)),
    toggleStatus: (filter) => {
      updateView((current) => toggleStatus(current, filter));
    },
    toggleOnly: (filter) => {
      updateView((current) => toggleOnly(current, filter));
    },
    togglePriority: (priority) => {
      updateView((current) => togglePriority(current, priority));
    },
    setSort: (sort) => {
      updateView((current) => withSort(current, sort));
    },
    start,
  };
};
