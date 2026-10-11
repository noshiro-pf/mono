/**
 * The DAG canvas's view transform: content drawn at `scale` and moved by `(x, y)`,
 * so the content point `c` is on the screen at `(x + c.x * scale, y + c.y *
 * scale)`. Every function keeps that one rule and returns a new transform.
 */

import { Num } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';

export const MIN_SCALE = 0.2;

export const MAX_SCALE = 3;

export const panBy = (
  transform: ViewTransform,
  dx: number,
  dy: number,
): ViewTransform =>
  ({
    x: transform.x + dx,
    y: transform.y + dy,
    scale: transform.scale,
  }) as const;

/**
 * Zoomed by `factor` about the screen point `(px, py)`, which stays over the
 * same content point. The scale stops at {@link MIN_SCALE} and
 * {@link MAX_SCALE}.
 */
export const zoomAt = (
  transform: ViewTransform,
  factor: number,
  px: number,
  py: number,
): ViewTransform => {
  const scale = clampScale(transform.scale * factor);

  const ratio = ratioOf(scale, transform.scale);

  return {
    x: px - (px - transform.x) * ratio,
    y: py - (py - transform.y) * ratio,
    scale,
  };
};

/**
 * The whole content in view, centred, with `padding` clear around it — and
 * never larger than its natural size, which a graph of two nodes would
 * otherwise be blown up to.
 */
export const fitViewTransform = (
  content: Size,
  view: Size,
  padding: number,
): ViewTransform => {
  const scale = clampScale(
    Math.min(
      1,
      ratioOf(view.width - 2 * padding, content.width, 1),
      ratioOf(view.height - 2 * padding, content.height, 1),
    ),
  );

  return {
    x: (view.width - content.width * scale) / 2,
    y: (view.height - content.height * scale) / 2,
    scale,
  };
};

/**
 * {@link fitViewTransform} for content that occupies `bounds` rather than
 * starting at the origin — nodes put by hand can be anywhere.
 */
export const fitBoundsTransform = (
  bounds: Point & Size,
  view: Size,
  padding: number,
): ViewTransform => {
  const fitted = fitViewTransform(bounds, view, padding);

  return {
    x: fitted.x - bounds.x * fitted.scale,
    y: fitted.y - bounds.y * fitted.scale,
    scale: fitted.scale,
  };
};

/**
 * `bounds` as wide as the view less `padding` on each side, and no larger
 * than its natural size, with its top `topInset` below the view's: for content
 * that is long rather than wide, such as the arc diagram's column, which is
 * read by panning down it. Never smaller than `minScale`, so that a long
 * column is not shrunk out of reading; content still too wide at that scale
 * starts at the left, for the rest to be panned to.
 */
export const fitWidthTopTransform = (
  bounds: Point & Size,
  view: Size,
  options: Readonly<{ padding: number; topInset: number; minScale: number }>,
): ViewTransform => {
  const { padding, topInset, minScale } = options;

  const available = view.width - 2 * padding;

  const scale = clampScale(
    Math.max(minScale, Math.min(1, ratioOf(available, bounds.width, 1))),
  );

  const width = bounds.width * scale;

  const left = width <= available ? (view.width - width) / 2 : padding;

  return {
    x: left - bounds.x * scale,
    y: topInset - bounds.y * scale,
    scale,
  };
};

/**
 * The view a share `t` of the way from `from` to `to`: for a view that
 * follows nodes moving to a new layout, at the pace they move.
 */
export const interpolateTransform = (
  from: ViewTransform,
  to: ViewTransform,
  t: number,
): ViewTransform =>
  ({
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
    scale: from.scale + (to.scale - from.scale) * t,
  }) as const;

/**
 * Where a two-finger gesture that started at `from` with the transform `start`
 * has got to at `to`: zoomed by how much the distance between the fingers
 * changed, and moved so that the content point that was between them still
 * is.
 */
export const pinchViewTransform = (
  start: ViewTransform,
  from: FixedLengthTuple<2, Point>,
  to: FixedLengthTuple<2, Point>,
): ViewTransform => {
  const scale = clampScale(
    start.scale * ratioOf(distance(...to), distance(...from), 1),
  );

  const fromMid = midpoint(...from);

  const toMid = midpoint(...to);

  const contentX = ratioOf(fromMid.x - start.x, start.scale);

  const contentY = ratioOf(fromMid.y - start.y, start.scale);

  return {
    x: toMid.x - contentX * scale,
    y: toMid.y - contentY * scale,
    scale,
  };
};

/**
 * How much one wheel event zooms: a `deltaY` away from the reader zooms in.
 * Exponential, so a turn in and the same turn out cancel. `deltaMode` is the
 * event's: `1` counts lines (Firefox with a mouse wheel), which are taken as
 * 16 pixels each.
 */
export const wheelZoomFactor = (
  deltaY: number,
  deltaMode: number = 0,
): number =>
  Math.exp(-deltaY * (deltaMode === 1 ? LINE_PX : 1) * WHEEL_SENSITIVITY);

export type ViewTransform = Readonly<{ x: number; y: number; scale: number }>;

export type Point = Readonly<{ x: number; y: number }>;

export type Size = Readonly<{ width: number; height: number }>;

const WHEEL_SENSITIVITY = 0.0015;

const LINE_PX = 16;

const clampScale = (scale: number): number =>
  Num.clamp(scale, MIN_SCALE, MAX_SCALE);

/**
 * `a / b`, or `whenZero` for a zero `b` — an empty graph, a view not laid out
 * yet, two fingers on one spot. The default makes such a case clamp to the
 * smallest scale rather than produce `Infinity` or `NaN`.
 */
const ratioOf = (a: number, b: number, whenZero: number = 0): number =>
  Num.isNonZero(b) ? Num.div(a, b) : whenZero;

const distance = (a: Point, b: Point): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

const midpoint = (a: Point, b: Point): Point =>
  ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  }) as const;
