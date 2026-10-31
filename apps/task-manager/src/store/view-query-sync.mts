/**
 * Keeps the URL's query saying which screen is shown, and the graph's view mode
 * and filter on it (`view-model/view-query.mts`, `view-model/dag-filter.mts`),
 * so that a reload opens them again. Reading the query when the page loads is
 * `store.mts`'s; this only writes, and only when the URL says something else.
 */

import { combine, type InitializedObservable } from 'synstate';
import {
  NO_DAG_FILTER,
  withDagFilterQuery,
  withViewQuery,
  type DagFilter,
  type DagViewMode,
  type View,
} from '../view-model/index.mjs';

export type ViewQuerySyncDeps = Readonly<{
  view: InitializedObservable<View>;
  mode: InitializedObservable<DagViewMode>;
  /** Written while the graph is shown only, as its mode is. */
  filter: InitializedObservable<DagFilter>;
  /** The URL's query as it is now. */
  read: () => string;
  /** Puts `search` in place of the URL's query, adding no history entry. */
  write: (search: string) => void;
}>;

export type ViewQuerySync = Readonly<{
  /** Starts writing, and returns what stops it. */
  start: () => () => void;
}>;

export const createViewQuerySync = (deps: ViewQuerySyncDeps): ViewQuerySync =>
  ({
    start: () => {
      const subscription = combine([
        deps.view,
        deps.mode,
        deps.filter,
      ]).subscribe(([view, mode, filter]) => {
        const current = deps.read();

        const next = withDagFilterQuery(
          withViewQuery(current, { view, mode }),
          view === 'dag' ? filter : NO_DAG_FILTER,
        );

        if (next !== current) {
          deps.write(next);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    },
  }) as const;
