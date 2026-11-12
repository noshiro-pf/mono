import { Num, Result } from 'ts-data-forge';
import type { ParamCodec } from '../url/index.mjs';

/** How the DAG is drawn: to fit its box, or at a scale (1 is natural). */
export type DagZoom = Readonly<
  { kind: 'fit' } | { kind: 'scale'; scale: number }
>;

/** The scales − and + step through, smallest first. */
export const ZOOM_STEPS = [
  0.1, 0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3,
] as const;

export const NATURAL_ZOOM: DagZoom = { kind: 'scale', scale: 1 } as const;

/** `dag.zoom=125` (percent) or `dag.zoom=fit`; natural size by default. */
export const dagZoomCodec: ParamCodec<DagZoom> = {
  read: (params) => {
    const value = params.get(KEY);

    if (value === 'fit') {
      return { kind: 'fit' };
    }

    if (value === null || !/^\d{1,4}$/u.test(value)) {
      return NATURAL_ZOOM;
    }

    return {
      kind: 'scale',
      scale: Num.clamp(
        Result.unwrapOkOr(Num.safeParseInt(value), 100) / 100,
        MIN_SCALE,
        MAX_SCALE,
      ),
    };
  },
  write: (zoom, params) => {
    if (zoom.kind === 'fit') {
      params.set(KEY, 'fit');
    } else if (Math.abs(zoom.scale - 1) < EPSILON) {
      params.delete(KEY);
    } else {
      params.set(KEY, Math.round(zoom.scale * 100).toString());
    }
  },
} as const;

/** The next step above `scale`, or the largest. */
export const zoomInFrom = (scale: number): number =>
  ZOOM_STEPS.find((step) => step > scale + EPSILON) ?? MAX_SCALE;

/** The next step below `scale`, or the smallest. */
export const zoomOutFrom = (scale: number): number =>
  ZOOM_STEPS.findLast((step) => step < scale - EPSILON) ?? MIN_SCALE;

/**
 * The scale that draws `content` whole in `box`: never above natural size,
 * never below the smallest step, rounded down so it never needs a scroll bar.
 * A box not measured yet leaves natural size.
 */
export const fitScale = (
  content: Readonly<{ width: number; height: number }>,
  box: Readonly<{ width: number; height: number }>,
): number => {
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

const KEY = 'dag.zoom';

const MIN_SCALE = ZOOM_STEPS[0];

const MAX_SCALE = 3;

const EPSILON = 0.001;
