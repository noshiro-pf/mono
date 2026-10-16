/**
 * How large the issue DAG is drawn (`issue-dag.tsx`): the layout's units
 * (`issue-graph-layout.mts`) times a scale, in a box that scrolls. A zoom in
 * or out moves to the next of a fixed set of steps, as a browser's zoom does,
 * so that a turn in and a turn out come back to where they started and 100%
 * is always one of them; the fit is whatever puts the whole graph in the box,
 * and may fall between two steps.
 */

import { Num } from 'ts-data-forge';

/** The scales a zoom in or out moves between, smallest first. */
export const ZOOM_STEPS = [
  0.1, 0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3,
] as const;

export const MIN_SCALE = ZOOM_STEPS[0];

export const MAX_SCALE = ZOOM_STEPS.at(-1) ?? 1;

export type Size = Readonly<{ width: number; height: number }>;

export type Point = Readonly<{ x: number; y: number }>;

/** Where a box is scrolled to, and how much of what it holds it shows. */
export type ScrollBox = Size & Readonly<{ left: number; top: number }>;

/**
 * The scale at which all of `content` is in `box`: never larger than the
 * natural size, which a graph of two nodes would otherwise be blown up to,
 * and never smaller than {@link MIN_SCALE}, below which no title can be read.
 * Rounded down, so that the graph drawn at it is never a fraction of a pixel
 * larger than the box, which would give the box a scroll bar to take away
 * the room the fit was worked out for. A box not measured yet, which has no
 * room to fit anything into, leaves the natural size.
 */
export const fitScale = (content: Size, box: Size): number => {
  if (
    box.width <= 0 ||
    box.height <= 0 ||
    !Num.isPositive(content.width) ||
    !Num.isPositive(content.height)
  ) {
    return 1;
  }

  const scale = Math.min(
    1,
    Num.div(box.width, content.width),
    Num.div(box.height, content.height),
  );

  return Math.max(MIN_SCALE, Math.floor(scale * 1000) / 1000);
};

/** The next step above `scale`, or {@link MAX_SCALE} when there is none. */
export const zoomInFrom = (scale: number): number =>
  ZOOM_STEPS.find((step) => step > scale + EPSILON) ?? MAX_SCALE;

/** The next step below `scale`, or {@link MIN_SCALE} when there is none. */
export const zoomOutFrom = (scale: number): number =>
  ZOOM_STEPS.findLast((step) => step < scale - EPSILON) ?? MIN_SCALE;

/**
 * The point of `content`, in the layout's units, at the middle of `box` while
 * it is drawn at `scale`: what a zoom keeps where it is. Across which the
 * whole of it is in the box, it is the middle of the content instead, since
 * the middle of the box may be past its end and what is looked at is all of
 * it. Content drawn at no size at all has nothing at the middle but its
 * start.
 */
export const centreAt = (
  box: ScrollBox,
  content: Size,
  scale: number,
): Point => {
  if (!Num.isNonZero(scale)) {
    return { x: 0, y: 0 };
  }

  return {
    x:
      content.width * scale <= box.width
        ? content.width / 2
        : Num.div(box.left + box.width / 2, scale),
    y:
      content.height * scale <= box.height
        ? content.height / 2
        : Num.div(box.top + box.height / 2, scale),
  };
};

/**
 * Where to scroll `box` so that `centre` is at its middle with the graph drawn
 * at `scale`. A point too near the start of the graph to be at the middle
 * leaves the box scrolled to the start; the browser keeps a scroll past the
 * end within the end itself.
 */
export const scrollToCentre = (
  centre: Point,
  box: Size,
  scale: number,
): Readonly<{ left: number; top: number }> =>
  ({
    left: Math.max(0, centre.x * scale - box.width / 2),
    top: Math.max(0, centre.y * scale - box.height / 2),
  }) as const;

/** A scale this close to a step is that step. */
const EPSILON = 1e-6;
