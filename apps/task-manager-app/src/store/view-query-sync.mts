/**
 * Keeps the URL's query saying which screen is shown, and the graph's view
 * mode on it (`view-model/view-query.mts`), so that a reload opens them
 * again. Reading the query when the page loads is `store.mts`'s; this only
 * writes, and only when the URL says something else.
 */

import { combine, type InitializedObservable } from 'synstate';
import {
  withViewQuery,
  type DagViewMode,
  type View,
} from '../view-model/index.mjs';

export type ViewQuerySyncDeps = Readonly<{
  view: InitializedObservable<View>;
  mode: InitializedObservable<DagViewMode>;
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
      const subscription = combine([deps.view, deps.mode]).subscribe(
        ([view, mode]) => {
          const current = deps.read();

          const next = withViewQuery(current, { view, mode });

          if (next !== current) {
            deps.write(next);
          }
        },
      );

      return () => {
        subscription.unsubscribe();
      };
    },
  }) as const;
