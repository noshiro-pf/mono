/**
 * The zoom ladder of a pane (spec P4): Chrome's own steps, cut to the range a
 * pane is any use at. Its ends are also the clamp for a stored value.
 */
export const zoomLevels = [
  0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2,
] as const;

export const defaultZoom = 1;

export type ZoomStep = 'in' | 'out' | 'reset';

export const clampZoom = (zoom: number): number =>
  Number.isFinite(zoom)
    ? Math.min(zoomLevels.at(-1) ?? 2, Math.max(zoomLevels[0], zoom))
    : defaultZoom;

/** The next level that way, or `current` itself at the end of the ladder. */
export const stepZoom = (current: number, step: ZoomStep): number => {
  const from = clampZoom(current);

  switch (step) {
    case 'reset':
      return defaultZoom;

    case 'in':
      return zoomLevels.find((level) => level > from + tolerance) ?? from;

    case 'out':
      return zoomLevels.findLast((level) => level < from - tolerance) ?? from;
  }
};

export const formatZoom = (zoom: number): string =>
  `${Math.round(zoom * 100).toString()}%` as const;

/** Swallows the rounding in a level like `0.67`; no two levels are this close. */
const tolerance = 0.001;
