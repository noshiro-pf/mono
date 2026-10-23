import { arrowKeyDelta } from '../dag/index.mjs';
import {
  GraphNodeIdCodec,
  nodeId,
  type GraphNodeId,
  type NodeRef,
} from '../domain/index.mjs';
import { dagLayoutStore, editorStore } from '../store/index.mjs';

/**
 * What a node of the DAG does: a tap, or Enter or Space when it is focused,
 * opens it; an arrow key moves it (further with Shift), which is saved once
 * the keys pause — when `isMovable` says so, which it does in the view modes
 * the reader arranges. Dragging it is the canvas's (`dag-canvas.tsx`).
 */
export const dagNodeHandlers = (
  ref: NodeRef,
  isMovable: () => boolean,
): Readonly<{
  openNode: () => void;
  onKeyDown: (pressed: KeyboardEvent) => void;
}> =>
  ({
    openNode: () => {
      editorStore.open(ref);
    },
    onKeyDown: (pressed) => {
      if (pressed.key === 'Enter' || pressed.key === ' ') {
        pressed.preventDefault();

        editorStore.open(ref);

        return;
      }

      const delta = arrowKeyDelta(pressed.key, pressed.shiftKey);

      if (delta === undefined || !isMovable()) {
        return;
      }

      // Not the page's scrolling, which the arrow keys also do.
      pressed.preventDefault();

      dagLayoutStore.nudgeNode(nodeId(ref), delta);
    },
  }) as const;

/**
 * The node `target` is part of, by its `data-node-id`; `undefined` off one.
 * The canvas finds the node an event came from this way, so the nodes need
 * no handlers for it.
 */
export const nodeIdOf = (
  target: EventTarget | null,
): GraphNodeId | undefined => {
  const element =
    target instanceof Element ? target.closest('[data-node-id]') : null;

  const id =
    element instanceof SVGElement ? element.dataset['nodeId'] : undefined;

  return id !== undefined && GraphNodeIdCodec.is(id) ? id : undefined;
};
