/**
 * The order of 「アーク」 and 「タイル」 (`view-model/diagram-sort.mts`),
 * saved whenever it changes. Moving the tasks to their new places is the
 * DAG layout store's.
 */

import { createState, type InitializedObservable } from 'synstate';
import { type SortSpec } from '../domain/index.mjs';
import { sortKeyActions, type SortKeyActions } from '../view-model/index.mjs';

export type DiagramSortDeps = Readonly<{
  initial: readonly SortSpec[];
  save: (sort: readonly SortSpec[]) => void;
}>;

export type DiagramSortStore = SortKeyActions &
  Readonly<{
    sort: InitializedObservable<readonly SortSpec[]>;
    /** Starts saving, and returns what stops it. */
    start: () => () => void;
  }>;

export const createDiagramSortStore = (
  deps: DiagramSortDeps,
): DiagramSortStore => {
  const [sort, , { updateState }] = createState<readonly SortSpec[]>(
    deps.initial,
  );

  return {
    sort,
    ...sortKeyActions(updateState),
    start: () => {
      const subscription = sort.subscribe(deps.save);

      return () => {
        subscription.unsubscribe();
      };
    },
  };
};
