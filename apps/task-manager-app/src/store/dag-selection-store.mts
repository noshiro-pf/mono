/**
 * The nodes selected on the DAG — by the lasso (`dag/lasso.mts`) — which a
 * drag of one of them moves together and 「一括編集」 edits together
 * (`bulk-edit-store.mts`). Selected nodes that are gone, or hidden, drop
 * out of it, and the whole of it is dropped when the DAG stops being drawn
 * in the mode the reader arranges.
 */

import {
  combine,
  createState,
  map,
  type InitializedObservable,
} from 'synstate';
import { Arr } from 'ts-data-forge';
import {
  listNodes,
  type DomainState,
  type GraphNodeId,
} from '../domain/index.mjs';

export type DagSelectionDeps = Readonly<{
  state: InitializedObservable<DomainState>;
  /** The nodes drawn in no mode (`dag/hidden-nodes.mts`). */
  hidden: InitializedObservable<ReadonlySet<GraphNodeId>>;
  /** Whether 「DAG」 is on screen; the selection is dropped when it is not. */
  active: InitializedObservable<boolean>;
}>;

export type DagSelectionStore = Readonly<{
  /** The nodes selected that are there and drawn, in the order selected. */
  selected: InitializedObservable<readonly GraphNodeId[]>;
  /** Selects `ids` alone, in place of whatever was selected. */
  select: (ids: readonly GraphNodeId[]) => void;
  clear: () => void;
  /** Starts following `active`, and returns what stops it. */
  start: () => () => void;
}>;

export const createDagSelectionStore = (
  deps: DagSelectionDeps,
): DagSelectionStore => {
  const [chosen, setChosen] = createState<readonly GraphNodeId[]>([]);

  const selected = combine([chosen, deps.state, deps.hidden]).pipe(
    map(([ids, state, hidden]) => {
      const there = new Set(listNodes(state).map(({ id }) => id));

      const kept = ids.filter((id) => there.has(id) && !hidden.has(id));

      return kept.length === ids.length ? ids : kept;
    }),
  );

  const clear = (): void => {
    setChosen([]);
  };

  return {
    selected,
    select: (ids) => {
      setChosen(Arr.uniq(ids));
    },
    clear,
    start: () => {
      const subscription = deps.active.subscribe((active) => {
        if (!active) {
          clear();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    },
  };
};
