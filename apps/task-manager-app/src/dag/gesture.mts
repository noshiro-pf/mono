/**
 * Pan with one pointer, pinch with two, drag a node with one that went down
 * on it, and tell a tap from a drag — as a reducer over pointer events, so
 * the canvas component only forwards them.
 *
 * Every gesture is measured from where it started (the transform and the
 * pointers when the number of pointers last changed), not from the previous
 * move, so rounding does not accumulate. A press that moves less than
 * {@link DRAG_THRESHOLD_PX} is a tap; `dragging` stays set after the release
 * until the next press, so the click that follows a drag can be told apart
 * and swallowed.
 *
 * A node being dragged follows the pointer (`nodeDrag`) and is dropped where
 * it is when that pointer lifts — the one moment its position is saved. A
 * second finger turns the press into a pinch, which leaves the node where it
 * was.
 */

import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import type { GraphNodeId } from '../domain/index.mjs';
import { dragPosition } from './dag-layout.mjs';
import {
  panBy,
  pinchViewTransform,
  type Point,
  type ViewTransform,
} from './pan-zoom.mjs';

export const DRAG_THRESHOLD_PX = 6;

export const IDLE_GESTURE: Gesture = {
  pointers: [],
  start: undefined,
  dragging: false,
  nodeDrag: undefined,
} as const;

/**
 * A pointer went down — on the node `grab`, which may then be dragged, or on
 * the background.
 */
export const pointerDown = (
  gesture: Gesture,
  pointer: TrackedPointer,
  transform: ViewTransform,
  grab?: NodeGrab,
): Gesture => {
  const pointers = Arr.toPushed(
    gesture.pointers.filter(({ id }) => id !== pointer.id),
    pointer,
  ).slice(-2);

  const pinching = Arr.isMinLengthArray(2, pointers);

  return {
    pointers,
    start: { transform, pointers, grab: pinching ? undefined : grab },
    dragging:
      pinching || (Arr.isNonEmpty(gesture.pointers) && gesture.dragging),
    nodeDrag: undefined,
  };
};

/** The gesture moved on, and the transform to show, if it changed. */
export const pointerMove = (
  gesture: Gesture,
  pointer: TrackedPointer,
): Readonly<{ gesture: Gesture; transform: ViewTransform | undefined }> => {
  const { start } = gesture;

  if (
    start === undefined ||
    gesture.pointers.every(({ id }) => id !== pointer.id)
  ) {
    return { gesture, transform: undefined };
  }

  const pointers = gesture.pointers.map((tracked) =>
    tracked.id === pointer.id ? pointer : tracked,
  );

  const [first, second] = pointers;

  const [startFirst, startSecond] = start.pointers;

  if (
    first !== undefined &&
    second !== undefined &&
    startFirst !== undefined &&
    startSecond !== undefined
  ) {
    return {
      gesture: { ...gesture, pointers, dragging: true },
      transform: pinchViewTransform(
        start.transform,
        [startFirst, startSecond],
        [first, second],
      ),
    };
  }

  if (first === undefined || startFirst === undefined) {
    return { gesture, transform: undefined };
  }

  const dx = first.x - startFirst.x;

  const dy = first.y - startFirst.y;

  const dragging = gesture.dragging || Math.hypot(dx, dy) > DRAG_THRESHOLD_PX;

  if (start.grab !== undefined) {
    return {
      gesture: {
        ...gesture,
        pointers,
        dragging,
        nodeDrag: dragging
          ? {
              id: start.grab.id,
              position: dragPosition(
                start.grab.origin,
                startFirst,
                first,
                start.transform.scale,
              ),
            }
          : undefined,
      },
      transform: undefined,
    };
  }

  return {
    gesture: { ...gesture, pointers, dragging },
    transform: dragging ? panBy(start.transform, dx, dy) : undefined,
  };
};

/**
 * The pointer `id` lifted, with `transform` on screen, and the node it
 * dropped if it was dragging one. A pinch that loses a finger becomes a pan
 * from where it is.
 */
export const pointerUp = (
  gesture: Gesture,
  id: number,
  transform: ViewTransform,
): Readonly<{ gesture: Gesture; dropped: NodeDrag | undefined }> => {
  const pointers = gesture.pointers.filter((tracked) => tracked.id !== id);

  return {
    gesture: {
      pointers,
      start: Arr.isNonEmpty(pointers)
        ? { transform, pointers, grab: undefined }
        : undefined,
      dragging: gesture.dragging,
      nodeDrag: undefined,
    },
    dropped: gesture.pointers.some((tracked) => tracked.id === id)
      ? gesture.nodeDrag
      : undefined,
  };
};

export type TrackedPointer = Readonly<{ id: number }> & Point;

/** The node a pointer went down on, and where it was then. */
export type NodeGrab = Readonly<{ id: GraphNodeId; origin: Point }>;

/** Where a node being dragged is. */
export type NodeDrag = Readonly<{ id: GraphNodeId; position: Point }>;

export type Gesture = DeepReadonly<{
  /** At most two: a third finger is not part of the gesture. */
  pointers: TrackedPointer[];
  start:
    | {
        transform: ViewTransform;
        pointers: TrackedPointer[];
        /** The node being pressed, which a move drags; none for a pinch. */
        grab: NodeGrab | undefined;
      }
    | undefined;
  /** Moved past the threshold, or pinched, since the last press began. */
  dragging: boolean;
  nodeDrag: NodeDrag | undefined;
}>;
