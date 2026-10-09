/**
 * Scrolling 「タイル」 (`tile-layout.mts`): down and up only, never zoomed.
 * The offset is how far the content has been scrolled up, in pixels — the
 * view's transform (`tileViewTransform`) puts the top of the first row
 * `topInset` below the top of the canvas, less the offset. The rows are seen
 * in a part of the canvas `visible` high, below the toolbar; the offset runs
 * from 0, the first row at the top of it, to where the last row is at its
 * bottom, and stays 0 for content that it shows whole.
 */

import { Num } from 'ts-data-forge';
import { type Point, type ViewTransform } from './pan-zoom.mjs';
import { TILE_MARGIN } from './tile-layout.mjs';

/** The shortest the scroll indicator's thumb is drawn. */
export const TILE_MIN_THUMB = 24;

/** How far down `content` can be scrolled, seen `visible` high. */
export const maxTileScroll = (content: number, visible: number): number =>
  Math.max(0, content - visible);

/** `offset`, kept between the first row at the top and the last at the bottom. */
export const clampTileScroll = (
  offset: number,
  content: number,
  visible: number,
): number => Num.clamp(offset, 0, maxTileScroll(content, visible));

/**
 * Where `key` scrolls to from `offset`: Page Down and Page Up by most of
 * what is visible, so a row stays in sight across the page, Home to the top and End
 * to the bottom. `undefined` for any other key, which scrolls nothing.
 */
export const tileKeyScroll = (
  key: string,
  offset: number,
  visible: number,
  content: number,
): number | undefined => {
  const page = visible * PAGE_SHARE;

  const target =
    key === 'PageDown'
      ? offset + page
      : key === 'PageUp'
        ? offset - page
        : key === 'Home'
          ? 0
          : key === 'End'
            ? maxTileScroll(content, visible)
            : undefined;

  return target === undefined
    ? undefined
    : clampTileScroll(target, content, visible);
};

/**
 * How far one wheel event scrolls, in pixels: `deltaMode` is the event's —
 * `1` counts lines, taken as 16 pixels each, and `2` pages, `visible` each.
 */
export const wheelScrollPixels = (
  deltaY: number,
  deltaMode: number,
  visible: number,
): number =>
  deltaY * (deltaMode === 1 ? LINE_PX : deltaMode === 2 ? visible : 1);

/**
 * The least scroll from `offset` that shows the node from `nodeTop` to
 * `nodeBottom` in the `visible` height — its top, if it is taller — for a
 * node given the focus.
 */
export const revealTileScroll = (
  offset: number,
  nodeTop: number,
  nodeBottom: number,
  visible: number,
): number =>
  nodeTop < offset || nodeBottom - nodeTop > visible
    ? nodeTop
    : nodeBottom > offset + visible
      ? nodeBottom - visible
      : offset;

/**
 * The offset that keeps the first node of the first row in view at
 * `offset`, nodes `nodeHeight` high, as far from the top after the nodes
 * move from `before` to `after` as it was — when a change of width makes
 * the rows longer or shorter. `ids` are in order, row by row; the result is
 * to be clamped to the content as it is after.
 */
export const anchoredTileScroll = <K,>(
  ids: readonly K[],
  before: ReadonlyMap<K, Point>,
  after: ReadonlyMap<K, Point>,
  offset: number,
  nodeHeight: number,
): number => {
  const anchor = ids.find((id) => {
    const at = before.get(id);

    return at !== undefined && at.y + nodeHeight > offset;
  });

  const from = anchor === undefined ? undefined : before.get(anchor);

  const to = anchor === undefined ? undefined : after.get(anchor);

  return from === undefined || to === undefined
    ? offset
    : to.y - (from.y - offset);
};

/**
 * The scroll indicator's thumb in a track `track` high: as tall a share of
 * it as `visible` is of the content, and as far down it as the offset is
 * of the way. `undefined` when there is nothing to scroll.
 */
export const tileScrollThumb = (
  offset: number,
  visible: number,
  content: number,
  track: number,
): Readonly<{ top: number; height: number }> | undefined => {
  const max = maxTileScroll(content, visible);

  if (!Num.isNonZero(max) || !Num.isNonZero(content)) {
    return undefined;
  }

  const height = Math.min(
    track,
    Math.max(TILE_MIN_THUMB, track * Num.div(visible, content)),
  );

  return {
    top: (track - height) * Num.div(Num.clamp(offset, 0, max), max),
    height,
  };
};

/** The view of 「タイル」 scrolled to `offset`, the rows `topInset` down. */
export const tileViewTransform = (
  offset: number,
  topInset: number,
): ViewTransform =>
  ({ x: TILE_MARGIN, y: topInset - offset, scale: 1 }) as const;

/** How far `transform` has scrolled 「タイル」, the rows `topInset` down. */
export const tileScrollOf = (
  transform: ViewTransform,
  topInset: number,
): number => topInset - transform.y;

/** Of what is visible, one Page Down: the rest stays in sight. */
const PAGE_SHARE = 0.875;

const LINE_PX = 16;
