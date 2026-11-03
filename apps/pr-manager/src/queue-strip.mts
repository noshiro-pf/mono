import { Num } from 'ts-data-forge';

/**
 * The Queue block's row of boxes as a strip that scrolls across
 * (`queue-section.tsx`), and the map of the whole queue above it: where the
 * strip is scrolled to, measured, and what the map and the tooltip make of it.
 *
 * Every box is the same width, so a fraction of the strip's scroll width is the
 * same fraction of the queue, which is how the map is drawn. The running box
 * stays at the start of the strip as the rest scroll under it, so once the
 * strip is scrolled, what is in view of the rest starts where that box ends.
 */

/** Whether some of the queue is out of view, which is when the map is drawn. */
export const overflows = (strip: QueueStrip): boolean =>
  strip.scrollWidth > strip.width;

/** The part of the queue in view, as fractions of the whole. */
export const windowOf = (
  strip: QueueStrip,
): Readonly<{ start: number; size: number }> => {
  const { scrollWidth } = strip;

  if (!overflows(strip) || !Num.isNonZero(scrollWidth)) {
    return { start: 0, size: 1 };
  }

  const start = scrolled(strip) ? strip.left + strip.held : 0;

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
  Num.clamp(
    fraction * strip.scrollWidth - (strip.width + strip.held) / 2,
    0,
    Math.max(0, strip.scrollWidth - strip.width),
  );

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

const scrolled = (strip: QueueStrip): boolean => strip.left >= 1;
