import { Num } from 'ts-data-forge';

/**
 * The Queue block's row of boxes as a strip that scrolls across
 * (`queue-section.tsx`), and the map of the whole queue above it: where the
 * strip is scrolled to, measured, and what the map and the tooltip make of it.
 *
 * Every box is the same width, so a fraction of the strip's scroll width is the
 * same fraction of the queue, which is how the map is drawn. The running box
 * stays at the start of the strip as the rest scroll under it, so what is in
 * view of the rest starts where that box ends, and moves as far as the strip is
 * scrolled: a frame dragged on the map stays under the pointer.
 */

/** Whether some of the queue is out of view, which is when the map is drawn. */
export const overflows = (strip: QueueStrip): boolean =>
  strip.scrollWidth > strip.width;

/**
 * The part of the queue in view beside the running box held at the start, as
 * fractions of the whole. The running box itself is always in view.
 */
export const windowOf = (
  strip: QueueStrip,
): Readonly<{ start: number; size: number }> => {
  const { scrollWidth } = strip;

  if (!overflows(strip) || !Num.isNonZero(scrollWidth)) {
    return { start: 0, size: 1 };
  }

  const start = strip.left + strip.held;

  const end = strip.left + strip.width;

  return {
    start: Num.clamp(Num.div(start, scrollWidth), 0, 1),
    size: Num.clamp(Num.div(end - start, scrollWidth), 0, 1),
  };
};

/**
 * Where to scroll the strip to so that the point of the map at `fraction` is in
 * the middle of what is in view beside the running box, or as near as either
 * end lets it.
 */
export const scrollLeftAt = (strip: QueueStrip, fraction: number): number =>
  scrollable(
    strip,
    fraction * strip.scrollWidth - (strip.width + strip.held) / 2,
  );

/**
 * Whether the point of the map at `fraction` is inside the frame round the part
 * in view, which is where a press starts dragging the frame as it is rather
 * than first moving it there.
 */
export const inWindow = (strip: QueueStrip, fraction: number): boolean => {
  const { start, size } = windowOf(strip);

  return start <= fraction && fraction <= start + size;
};

/**
 * Where to scroll the strip to when the frame is dragged `delta` of the map's
 * width across, from a drag that started with the strip scrolled to `from`, or
 * as near as either end lets it. Measured from where the drag started, so that
 * a pointer moved back to where it was pressed puts the strip back too.
 */
export const draggedLeft = (
  strip: QueueStrip,
  from: number,
  delta: number,
): number => scrollable(strip, from + delta * strip.scrollWidth);

/**
 * Whether some of the queue is out of view before and after what is in view,
 * which is where the strip fades out. Scrolled to either end, `left` can stop a
 * fraction of a pixel short of it.
 */
export const edgesOf = (
  strip: QueueStrip,
): Readonly<{ before: boolean; after: boolean }> =>
  ({
    before: overflows(strip) && scrolled(strip),
    after:
      overflows(strip) && strip.scrollWidth - strip.width - strip.left >= 1,
  }) as const;

/**
 * Which end of the strip the tooltip of box `index` of `count` is drawn from:
 * the start for a box in the left half of what is in view, the end for one in
 * the right half (`queue-tip.tsx`).
 */
export const tipSideOf = (
  strip: QueueStrip,
  index: number,
  count: number,
): 'start' | 'end' => {
  if (!Num.isNonZero(count) || strip.width === 0) {
    return index < count / 2 ? 'start' : 'end';
  }

  const centre = Num.div(index + 0.5, count) * strip.scrollWidth - strip.left;

  return centre < strip.width / 2 ? 'start' : 'end';
};

/**
 * Where a wheel turned over the strip scrolls it to: across, by what a vertical
 * wheel turns, which a mouse wheel does without Shift held. `undefined` leaves
 * the wheel to the page — where the strip cannot move that way, at an end or
 * with nothing out of view, so that the page scrolls on past it rather than
 * stopping under the pointer — and to the browser for a sideways gesture, which
 * scrolls the strip itself, and a pinch (`ctrlKey`), which zooms.
 */
export const wheeledLeft = (
  strip: QueueStrip,
  wheel: QueueWheel,
): number | undefined => {
  // A page scrolled with the pointer passing over the strip scrolls the strip
  // first, to its end, and the page only after: a mouse wheel cannot be told
  // from a trackpad's vertical swipe, and turning a wheel over the strip to
  // scroll it across is what this is for.
  if (
    wheel.ctrlKey ||
    !overflows(strip) ||
    Math.abs(wheel.deltaX) >= Math.abs(wheel.deltaY)
  ) {
    return undefined;
  }

  const left = scrollable(
    strip,
    strip.left + wheel.deltaY * pixelsPer(wheel.deltaMode, strip),
  );

  return Math.abs(left - strip.left) < 1 ? undefined : left;
};

/** What {@link wheeledLeft} reads of a `WheelEvent`. */
export type QueueWheel = Readonly<{
  deltaX: number;
  deltaY: number;
  /** `WheelEvent`'s: 0 for pixels, 1 for lines, 2 for pages. */
  deltaMode: number;
  ctrlKey: boolean;
}>;

/** The strip as last measured, in CSS pixels. */
export type QueueStrip = Readonly<{
  /** How far it is scrolled. */
  left: number;
  /** How wide the part in view is. */
  width: number;
  /** How wide all the boxes are together. */
  scrollWidth: number;
  /** How wide the running box held at the start is; 0 with none. */
  held: number;
}>;

/** Before the strip is laid out. */
export const NO_STRIP: QueueStrip = {
  left: 0,
  width: 0,
  scrollWidth: 0,
  held: 0,
} as const;

/** A line of a wheel counted in lines, in pixels (`pixelsPer`). */
const LINE_PIXELS = 20;

// `WheelEvent`'s constants, which are not there to read outside a browser.
const DOM_DELTA_LINE = 1;

const DOM_DELTA_PAGE = 2;

/**
 * How many pixels a wheel's delta counts in its mode: a line about as high as
 * the browser scrolls a page by per line, and a page what is in view.
 */
const pixelsPer = (deltaMode: number, strip: QueueStrip): number =>
  deltaMode === DOM_DELTA_LINE
    ? LINE_PIXELS
    : deltaMode === DOM_DELTA_PAGE
      ? strip.width
      : 1;

const scrolled = (strip: QueueStrip): boolean => strip.left >= 1;

/** `left`, or the nearer end of how far the strip scrolls. */
const scrollable = (strip: QueueStrip, left: number): number =>
  Num.clamp(left, 0, Math.max(0, strip.scrollWidth - strip.width));
