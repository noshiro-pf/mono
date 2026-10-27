/**
 * The graph screen's filter (`view-model/dag-filter.mts`): which groups and
 * labels it shows. Read from the URL when the page loads, and written back
 * to it by `view-query-sync.mts`; what it leaves of the graph is worked out
 * in `store.mts` (`dag/node-filter.mts`).
 */

import { createState, type InitializedObservable } from 'synstate';
import type { GroupId } from '../domain/index.mjs';
import {
  NO_DAG_FILTER,
  toggled,
  type DagFilter,
} from '../view-model/index.mjs';

export type DagFilterDeps = Readonly<{
  initial: DagFilter;
}>;

export type DagFilterStore = Readonly<{
  filter: InitializedObservable<DagFilter>;
  /** Chooses the group, or 「グループなし」 for `undefined`, or takes it out. */
  toggleGroup: (id: GroupId | undefined) => void;
  /** Chooses the label, or 「ラベルなし」 for `undefined`, or takes it out. */
  toggleLabel: (label: string | undefined) => void;
  /** Chooses nothing: the whole graph. */
  clear: () => void;
}>;

export const createDagFilterStore = (deps: DagFilterDeps): DagFilterStore => {
  const [filter, setFilter, { updateState }] = createState<DagFilter>(
    deps.initial,
  );

  return {
    filter,
    toggleGroup: (id) => {
      updateState(
        (current) =>
          ({ ...current, groups: toggled(current.groups, id) }) as const,
      );
    },
    toggleLabel: (label) => {
      updateState(
        (current) =>
          ({ ...current, labels: toggled(current.labels, label) }) as const,
      );
    },
    clear: () => {
      setFilter(NO_DAG_FILTER);
    },
  };
};
