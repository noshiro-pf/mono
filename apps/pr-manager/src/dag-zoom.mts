/**
 * How large the issue DAG is drawn (`issue-dag.tsx`): the layout's units
 * (`issue-graph-layout.mts`) times a scale, in a box that scrolls. A zoom in or
 * out moves to the next of a fixed set of steps, as a browser's zoom does, so
 * that a turn in and a turn out come back to where they started and 100% is
 * always one of them; the fit is whatever puts the whole graph in the box, and
 * may fall between two steps.
 *
 * **Kept in the query string**, as the layout is (`layout.mts`): how large the
 * graph is drawn is part of how the page is looked at, so a reload or a
 * bookmark opens it at the same size. `dag.zoom=125` is a scale in whole
 * percent and `dag.zoom=fit` the fit; the natural size is the parameter's
 * absence. A value that is not `fit` or a whole number is the natural size, and
 * a scale out of range is clamped. Like the layout, it goes along to another
 * repository (`searchWithRepository`). What it does not keep is where a zoom
 * from the fit had put the nodes with no edge: a scale read back draws them
 * where they go by default, since that arrangement was chosen for a box the
 * next visit may not have.
 */

import { Num, Result } from 'ts-data-forge';
import {
  placeGrid,
  placementsFor,
  type ConnectedLayout,
  type GridPlacement,
} from './issue-graph-layout.mjs';
import { currentSearch, rewriteSearch, searchOf } from './url.mjs';

/** The scales a zoom in or out moves between, smallest first. */
export const ZOOM_STEPS = [
  0.1, 0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3,
] as const;

export const MIN_SCALE = ZOOM_STEPS[0];

export const MAX_SCALE = ZOOM_STEPS.at(-1) ?? 1;

/**
 * How the DAG is drawn: to fit its box, whatever the scale that takes, or at a
 * scale.
 */
export type DagZoom = Readonly<
  { type: 'fit' } | { type: 'scale'; scale: number }
>;

export const NATURAL_ZOOM: DagZoom = { type: 'scale', scale: 1 } as const;

export const dagZoomFromSearch = (search: string): DagZoom => {
  const params = new URLSearchParams(search);

  const value = params.get(ZOOM_PARAM);

  if (value === 'fit') {
    return { type: 'fit' };
  }

  if (value === null || !PERCENT_PATTERN.test(value)) {
    return NATURAL_ZOOM;
  }

  return {
    type: 'scale',
    // Digits too many for a number are past the largest scale.
    scale: Num.clamp(
      Result.unwrapOkOr(Num.safeParseFloat(value), MAX_SCALE * 100) / 100,
      MIN_SCALE,
      MAX_SCALE,
    ),
  };
};

/**
 * The query string with the zoom written into it, and the other parameters left
 * as they were.
 */
export const searchWithDagZoom = (search: string, zoom: DagZoom): string => {
  const params = new URLSearchParams(search);

  const percent = zoom.type === 'fit' ? 'fit' : Math.round(zoom.scale * 100);

  if (percent === 100) {
    params.delete(ZOOM_PARAM);
  } else {
    params.set(ZOOM_PARAM, percent.toString());
  }

  return searchOf(params);
};

/** What the query string asks for, now. */
export const dagZoomFromLocation = (): DagZoom =>
  dagZoomFromSearch(currentSearch());

/** Writes the zoom into the address bar; see `rewriteSearch`. */
export const saveDagZoom = (zoom: DagZoom): void => {
  rewriteSearch((search) => searchWithDagZoom(search, zoom));
};

export type Size = Readonly<{ width: number; height: number }>;

export type Point = Readonly<{ x: number; y: number }>;

/** Where a box is scrolled to, and how much of what it holds it shows. */
export type ScrollBox = Size & Readonly<{ left: number; top: number }>;

/**
 * The scale at which all of `content` is in `box`: never larger than the
 * natural size, which a graph of two nodes would otherwise be blown up to, and
 * never smaller than {@link MIN_SCALE}, below which no title can be read.
 * Rounded down, so that the graph drawn at it is never a fraction of a pixel
 * larger than the box, which would give the box a scroll bar to take away the
 * room the fit was worked out for. A box not measured yet, which has no room to
 * fit anything into, leaves the natural size.
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

/**
 * Where the nodes with no edge go for the fit: of every placement
 * (`placementsFor`), the one that lets the whole graph be drawn the largest in
 * `box` — a wide box takes them in longer rows, beside the connected parts or
 * around them, and a tall one in shorter rows under them. The first is the
 * default, which is kept while nothing does better, so that a graph that
 * already fits at its natural size is drawn as it always is.
 */
export const fitPlacement = (
  parts: ConnectedLayout,
  box: Size,
): GridPlacement => {
  const [first, ...rest] = placementsFor(parts);

  const scaleOf = (placement: GridPlacement): number =>
    fitScale(placeGrid(parts, placement), box);

  return rest.reduce(
    (best, placement) => {
      const scale = scaleOf(placement);

      return scale > best.scale ? { placement, scale } : best;
    },
    { placement: first, scale: scaleOf(first) },
  ).placement;
};

/** The next step above `scale`, or {@link MAX_SCALE} when there is none. */
export const zoomInFrom = (scale: number): number =>
  ZOOM_STEPS.find((step) => step > scale + EPSILON) ?? MAX_SCALE;

/** The next step below `scale`, or {@link MIN_SCALE} when there is none. */
export const zoomOutFrom = (scale: number): number =>
  ZOOM_STEPS.findLast((step) => step < scale - EPSILON) ?? MIN_SCALE;

/**
 * The point of `content`, in the layout's units, at the middle of `box` while
 * it is drawn at `scale`: what a zoom keeps where it is. Across which the whole
 * of it is in the box, it is the middle of the content instead, since the
 * middle of the box may be past its end and what is looked at is all of it.
 * Content drawn at no size at all has nothing at the middle but its start.
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
 * leaves the box scrolled to the start; the browser keeps a scroll past the end
 * within the end itself.
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

const ZOOM_PARAM = 'dag.zoom';

/** Whole percents, which is all that is written. */
const PERCENT_PATTERN = /^\d+$/u;

/** A scale this close to a step is that step. */
const EPSILON = 1e-6;
