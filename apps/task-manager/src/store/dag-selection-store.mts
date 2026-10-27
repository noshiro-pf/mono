/**
 * The nodes selected on the DAG — by the lasso or the rectangle
 * (`dag/lasso.mts`) — which a drag of one of them moves together and
 * 「一括編集」 edits together (`bulk-edit-store.mts`). Selected nodes that
 * are gone, or hidden, drop out of it, and the whole of it is dropped when
 * the DAG stops being drawn in the mode the reader arranges.
 */

import {
  combine,
  createState,
  createValueEmitter,
  empty,
  filter,
  map,
  mapTo,
  merge,
  switchMap,
  withInitialValue,
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
  // While `start` has been called and its stop has not; `active` is
  // followed only then.
  const [started, setStarted] = createState(false);

  const [chose, setChosen] = createValueEmitter<readonly GraphNodeId[]>();

  const dropped = started.pipe(
    switchMap((isStarted) =>
      isStarted
        ? deps.active.pipe(filter((active) => !active)).pipe(mapTo(NONE_CHOSEN))
        : empty<readonly GraphNodeId[]>(),
    ),
  );

  // Dropped as part of the update that turns `active` off, rather than by a
  // subscriber of it, which would be a write while that update propagates.
  const chosen = merge([chose, dropped]).pipe(withInitialValue(NONE_CHOSEN));

  const selected = combine([chosen, deps.state, deps.hidden]).pipe(
    map(([ids, state, hidden]) => {
      const there = new Set(listNodes(state).map(({ id }) => id));

      const kept = ids.filter((id) => there.has(id) && !hidden.has(id));

      return kept.length === ids.length ? ids : kept;
    }),
  );

  const clear = (): void => {
    setChosen(NONE_CHOSEN);
  };

  return {
    selected,
    select: (ids) => {
      setChosen(Arr.uniq(ids));
    },
    clear,
    start: () => {
      setStarted(true);

      return () => {
        setStarted(false);
      };
    },
  };
};

const NONE_CHOSEN: readonly GraphNodeId[] = [] as const;
