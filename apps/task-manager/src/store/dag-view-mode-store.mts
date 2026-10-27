/**
 * The graph screen's view mode (`view-model/dag-view-mode.mts`), saved
 * whenever it changes. Moving the nodes between the modes is the DAG layout
 * store's.
 */

import { createState, type InitializedObservable } from 'synstate';
import type { DagViewMode } from '../view-model/index.mjs';

export type DagViewModeDeps = Readonly<{
  initial: DagViewMode;
  save: (mode: DagViewMode) => void;
}>;

export type DagViewModeStore = Readonly<{
  mode: InitializedObservable<DagViewMode>;
  set: (mode: DagViewMode) => void;
  /** Starts saving, and returns what stops it. */
  start: () => () => void;
}>;

export const createDagViewModeStore = (
  deps: DagViewModeDeps,
): DagViewModeStore => {
  const [mode, setMode] = createState<DagViewMode>(deps.initial);

  return {
    mode,
    set: (next) => {
      setMode(next);
    },
    start: () => {
      const subscription = mode.subscribe(deps.save);

      return () => {
        subscription.unsubscribe();
      };
    },
  };
};
