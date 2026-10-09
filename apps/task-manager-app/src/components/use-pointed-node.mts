import { type FocusEventHandler, type PointerEventHandler } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import { isGraphNodeId, type GraphNodeId } from '../domain/index.mjs';

/**
 * The node of the canvas the reader is pointing at — under the pointer, or
 * failing that, the one with the keyboard focus — for the arc diagram's
 * highlight. The handlers go on the `<svg>`, and find the node by the
 * `data-node-id` of the element the event came from, so the nodes need no
 * handlers of their own. A touch points at a node for as long as the finger
 * is on it.
 */
export const usePointedNode = (): Readonly<{
  pointed: GraphNodeId | undefined;
  onPointerOver: PointerEventHandler<SVGSVGElement>;
  onPointerLeave: PointerEventHandler<SVGSVGElement>;
  /** Focus does not bubble: these listen as it goes down to the node. */
  onFocusCapture: FocusEventHandler<SVGSVGElement>;
  onBlurCapture: FocusEventHandler<SVGSVGElement>;
}> => {
  const [hovered, setHovered] = useState<GraphNodeId | undefined>(undefined);

  const [focused, setFocused] = useState<GraphNodeId | undefined>(undefined);

  const onPointerOver = useCallback<PointerEventHandler<SVGSVGElement>>(
    (over) => {
      setHovered(nodeIdOf(over.target));
    },
    [],
  );

  const onPointerLeave = useCallback<PointerEventHandler<SVGSVGElement>>(() => {
    setHovered(undefined);
  }, []);

  const onFocusCapture = useCallback<FocusEventHandler<SVGSVGElement>>(
    (focusedIn) => {
      setFocused(nodeIdOf(focusedIn.target));
    },
    [],
  );

  const onBlurCapture = useCallback<FocusEventHandler<SVGSVGElement>>(() => {
    setFocused(undefined);
  }, []);

  return {
    pointed: hovered ?? focused,
    onPointerOver,
    onPointerLeave,
    onFocusCapture,
    onBlurCapture,
  };
};

/** The node `target` is part of, by its `data-node-id`; `undefined` off one. */
export const nodeIdOf = (
  target: EventTarget | null,
): GraphNodeId | undefined => {
  const element =
    target instanceof Element ? target.closest('[data-node-id]') : null;

  const id =
    element instanceof SVGElement ? element.dataset['nodeId'] : undefined;

  return id !== undefined && isGraphNodeId(id) ? id : undefined;
};
