/**
 * 「削除」 of the nodes selected on the DAG (`dag-selection-store.mts`), in
 * two steps as a node's own is (`editor-store.mts`): `request` asks, and
 * `confirm` deletes them, with every dependency on any of them.
 *
 * The question is about the selection as it stood when it was asked, so it
 * goes away as soon as the selection changes — a node selected, or one
 * dropping out because it was deleted elsewhere — and `confirm` then deletes
 * nothing. That holds by identity: `selected` hands the same array for as
 * long as the nodes in it stay the same, and a new one when they do not.
 */

import {
  combine,
  createState,
  map,
  type InitializedObservable,
} from 'synstate';
import { Arr } from 'ts-data-forge';
import { nodeRefOf, type GraphNodeId, type NodeRef } from '../domain/index.mjs';

export type BulkDeleteDeps = Readonly<{
  selected: InitializedObservable<readonly GraphNodeId[]>;
  deleteNodes: (refs: readonly NodeRef[]) => void;
}>;

export type BulkDeleteStore = Readonly<{
  /** Whether it is asking whether to delete the nodes selected. */
  confirming: InitializedObservable<boolean>;
  /** Asks; nothing while none is selected. */
  request: () => void;
  cancel: () => void;
  /** Deletes the nodes selected, if it is asking about them. */
  confirm: () => void;
}>;

export const createBulkDeleteStore = (
  deps: BulkDeleteDeps,
): BulkDeleteStore => {
  // The selection asked about, while it is being asked.
  const [requested, setRequested, { getSnapshot }] = createState<
    readonly GraphNodeId[] | undefined
  >(undefined);

  const asking = (
    asked: readonly GraphNodeId[] | undefined,
    selected: readonly GraphNodeId[],
  ): boolean => asked === selected && Arr.isNonEmpty(selected);

  return {
    confirming: combine([requested, deps.selected]).pipe(
      map(([asked, selected]) => asking(asked, selected)),
    ),
    request: () => {
      setRequested(deps.selected.getSnapshot().value);
    },
    cancel: () => {
      setRequested(undefined);
    },
    confirm: () => {
      const selected = deps.selected.getSnapshot().value;

      const asked = getSnapshot();

      setRequested(undefined);

      if (asking(asked, selected)) {
        deps.deleteNodes(selected.map(nodeRefOf));
      }
    },
  };
};
