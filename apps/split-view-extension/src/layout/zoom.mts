/**
 * How far a pane can be zoomed, and in what steps.
 *
 * Chrome's own ladder, cut to the range a pane is any use at: below a half a
 * site's own minimum widths take over, and above double a pane the size of a
 * quarter-screen holds a paragraph. The ends of it are also the clamp, so a
 * hand-edited value in storage cannot produce a pane that cannot be read.
 */
export const paneZoomLevels = [
  0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2,
] as const;

/** What a pane is at until someone changes it. */
export const defaultPaneZoom = 1;

export type PaneZoomStep = 'in' | 'out' | 'reset';

export const clampPaneZoom = (zoom: number): number =>
  Number.isFinite(zoom)
    ? Math.min(largestZoom, Math.max(smallestZoom, zoom))
    : defaultPaneZoom;

/**
 * The next step of the ladder in that direction, or where it already is when
 * there is no next step.
 *
 * Returning the same number at the ends is what lets the toolbar say "this
 * button would do nothing" by asking rather than by knowing the ladder.
 */
export const steppedPaneZoom = (
  current: number,
  step: PaneZoomStep,
): number => {
  if (step === 'reset') {
    return defaultPaneZoom;
  }

  const from = clampPaneZoom(current);

  return (
    (step === 'in'
      ? paneZoomLevels.find((level) => level > from + tolerance)
      : paneZoomLevels.findLast((level) => level < from - tolerance)) ?? from
  );
};

export const formatPaneZoom = (zoom: number): string =>
  `${String(Math.round(zoom * 100))}%` as const;

const smallestZoom = 0.5;

const largestZoom = 2;

/**
 * Wide enough to swallow the error in a level like `0.67`, narrow enough that
 * no two levels are within it of each other.
 */
const tolerance = 0.001;
