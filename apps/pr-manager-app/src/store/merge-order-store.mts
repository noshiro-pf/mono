/**
 * Which pull requests the merge order shows, and the tree that leaves.
 *
 * What a choice does is `merge-order-view.mts`; this holds the current one
 * and derives from it, with the report, what the merge order draws.
 *
 * The choice starts as everything shown, which is what the page draws until
 * `load` answers with what was saved — a database answers asynchronously,
 * and a report is not on screen before it anyway. Only then is anything
 * handed to `save`, so the default never overwrites a saved choice; and a
 * choice the reader made in that moment is kept over the saved one.
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
import type { Entry, LoadedReport } from '../load-report.mjs';
import {
  arrangeMergeOrder,
  countView,
  DEFAULT_MERGE_ORDER_VIEW,
  parseMergeOrderView,
  toggleOnly,
  togglePriority,
  toggleStatus,
  withSort,
  type MergeOrderCounts,
  type MergeOrderSort,
  type MergeOrderView,
  type Priority,
  type StatusFilter,
} from '../merge-order-view.mjs';

export type MergeOrderDeps = Readonly<{
  entries: InitializedObservable<readonly Entry[]>;
  roots: InitializedObservable<LoadedReport['roots']>;
  /** What was saved, as it was saved; it rejects when nothing can be read. */
  load: () => Promise<unknown>;
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
  /** Reads what was saved, then saves every change; returns what stops it. */
  start: () => () => void;
}>;

export const createMergeOrderStore = (
  deps: MergeOrderDeps,
): MergeOrderStore => {
  const [view, setView, { updateState: updateView }] =
    createState<MergeOrderView>(DEFAULT_MERGE_ORDER_VIEW);

  // Whether the reader has chosen anything yet.
  const mut_reader = { changed: false };

  const change = (next: (current: MergeOrderView) => MergeOrderView): void => {
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
        setView(parseMergeOrderView(stored));
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
    // Passed on only when it changed, as the reader's parts are: a pull
    // request whose checks moved changes the entries, not the tree.
    roots: combine([deps.roots, deps.entries, view])
      .pipe(
        map(([roots, entries, current]) =>
          arrangeMergeOrder(roots, entries, current),
        ),
      )
      .pipe(skipIfNoChange(fastDeepEqual)),
    counts: combine([deps.entries, view])
      .pipe(map(([entries, current]) => countView(entries, current)))
      .pipe(skipIfNoChange(fastDeepEqual)),
    toggleStatus: (filter) => {
      change((current) => toggleStatus(current, filter));
    },
    toggleOnly: (filter) => {
      change((current) => toggleOnly(current, filter));
    },
    togglePriority: (priority) => {
      change((current) => togglePriority(current, priority));
    },
    setSort: (sort) => {
      change((current) => withSort(current, sort));
    },
    start,
  };
};
