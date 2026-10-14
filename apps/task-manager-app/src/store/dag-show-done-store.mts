/**
 * Whether the graph screen draws the done tasks and the reached milestones
 * (`view-model/dag-show-done.mts`), saved whenever it changes. Which nodes
 * that leaves out is worked out in `store.mts`, for the DAG layout store and
 * the arcs.
 */

import { createState, type InitializedObservable } from 'synstate';

export type DagShowDoneDeps = Readonly<{
  initial: boolean;
  save: (showDone: boolean) => void;
}>;

export type DagShowDoneStore = Readonly<{
  showDone: InitializedObservable<boolean>;
  set: (showDone: boolean) => void;
  /** Starts saving, and returns what stops it. */
  start: () => () => void;
}>;

export const createDagShowDoneStore = (
  deps: DagShowDoneDeps,
): DagShowDoneStore => {
  const [showDone, setShowDone] = createState<boolean>(deps.initial);

  return {
    showDone,
    set: (next) => {
      setShowDone(next);
    },
    start: () => {
      const subscription = showDone.subscribe(deps.save);

      return () => {
        subscription.unsubscribe();
      };
    },
  };
};
