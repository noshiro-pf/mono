import type { KeyboardEventHandler } from 'preact';
import { useCallback } from 'preact/hooks';
import { arrowKeyDelta } from '../dag/index.mjs';
import { nodeId, type NodeRef } from '../domain/index.mjs';
import { dagLayoutStore, editorStore } from '../store/index.mjs';

/**
 * What a node of the DAG does: a tap, or Enter or Space when it is focused,
 * opens it; an arrow key moves it (further with Shift), which is saved once
 * the keys pause — when it is `movable`, which it is in the view modes the
 * reader arranges. Dragging it is the canvas's (`dag-canvas.tsx`).
 */
export const useDagNodeHandlers = (
  ref: NodeRef,
  movable: boolean,
): Readonly<{
  openNode: () => void;
  onKeyDown: KeyboardEventHandler<SVGGElement>;
}> => {
  const openNode = useCallback(() => {
    editorStore.open(ref);
  }, [ref]);

  const onKeyDown = useCallback<KeyboardEventHandler<SVGGElement>>(
    (pressed) => {
      if (pressed.key === 'Enter' || pressed.key === ' ') {
        pressed.preventDefault();

        editorStore.open(ref);

        return;
      }

      const delta = arrowKeyDelta(pressed.key, pressed.shiftKey);

      if (!movable || delta === undefined) {
        return;
      }

      // Not the page's scrolling, which the arrow keys also do.
      pressed.preventDefault();

      dagLayoutStore.nudgeNode(nodeId(ref), delta);
    },
    [ref, movable],
  );

  return { openNode, onKeyDown };
};
