/**
 * The node size (`view-model/node-size.mts`), saved whenever it changes.
 * Laying the nodes out at the new size, and moving them there, is the DAG
 * layout store's.
 */

import { createState, type InitializedObservable } from 'synstate';
import type { NodeSize } from '../view-model/index.mjs';

export type NodeSizeDeps = Readonly<{
  initial: NodeSize;
  save: (size: NodeSize) => void;
}>;

export type NodeSizeStore = Readonly<{
  size: InitializedObservable<NodeSize>;
  set: (size: NodeSize) => void;
  /** Starts saving, and returns what stops it. */
  start: () => () => void;
}>;

export const createNodeSizeStore = (deps: NodeSizeDeps): NodeSizeStore => {
  const [size, setSize] = createState<NodeSize>(deps.initial);

  return {
    size,
    set: (next) => {
      setSize(next);
    },
    start: () => {
      const subscription = size.subscribe(deps.save);

      return () => {
        subscription.unsubscribe();
      };
    },
  };
};
