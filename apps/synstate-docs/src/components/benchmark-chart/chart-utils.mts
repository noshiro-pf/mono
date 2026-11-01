/** Shared utilities for benchmark chart components. */

import { Arr, asUint32, Num } from 'ts-data-forge';

/**
 * How a line chart draws a series, in the plot and in the legend alike: a naive
 * form dashed, thinner and with smaller dots, so that it does not read as its
 * library's own line.
 */
export const lineStyleOf = (
  naive: boolean | undefined,
): Readonly<{
  strokeDasharray: string | undefined;
  strokeWidth: number;
  dotRadius: number;
}> =>
  naive === true
    ? ({ strokeDasharray: '5,3', strokeWidth: 1.5, dotRadius: 2 } as const)
    : ({ strokeDasharray: undefined, strokeWidth: 2, dotRadius: 3 } as const);

/**
 * A tick as its value reads, with as many decimals as the step gave it: the
 * ticks are rounded where they are made, and a fixed count of decimals would
 * print 0.05 and 0.1 alike.
 */
export const formatTickLabel = (v: number): string =>
  v >= 1000 ? (`${(v / 1000).toString()}s` as const) : v.toString();

/**
 * Ticks at a round step from the step up to `max`, none above it: the plot
 * clamps a value above its top to the top edge, where a tick would be drawn
 * under a label larger than the top. The step is a fraction below 5, which a
 * chart whose scale its data sets can reach.
 */
export const generateLinearTicks = (max: number): readonly number[] => {
  if (!Number.isFinite(max) || max <= 0) {
    return [];
  }

  const step = niceStep(max, 5);

  if (!Num.isNonZero(step)) {
    return [];
  }

  // A hair of tolerance, so that a tick on `max` survives the float division
  const count = Math.floor(Num.div(max, step) + 1e-9);

  return Arr.seq(asUint32(count)).map((i) =>
    // Rounding drops what a fractional step leaves, 3 × 0.1 being 0.30…04
    Num.roundAt((i + 1) * step, 9),
  );
};

export const generateLogTicks = (
  min: number,
  max: number,
): readonly number[] => {
  const mut_ticks: number[] = [];

  let mut_power = Math.floor(Math.log10(min));

  while (10 ** mut_power <= max) {
    const base = 10 ** mut_power;

    for (const m of [1, 2, 5] as const) {
      const v = base * m;

      if (min <= v && v <= max) {
        mut_ticks.push(v);
      }
    }

    mut_power += 1;
  }

  return mut_ticks;
};

/**
 * Compute Y-coordinate for a value, with optional log scale and clamping.
 */
export const createToY = (
  plotH: number,
  yMin: number,
  yMax: number,
  logScale: boolean,
): ((v: number) => number) => {
  if (logScale) {
    const logMin = Math.log10(yMin);

    const logMax = Math.log10(yMax);

    return (v: number): number => {
      const clamped = Math.max(v, yMin);

      return (
        // eslint-disable-next-line total-functions/no-partial-division
        plotH - ((Math.log10(clamped) - logMin) / (logMax - logMin)) * plotH
      );
    };
  }

  const toY = createUnclampedLinearToY(plotH, yMax);

  return (v: number): number => toY(Math.min(v, yMax));
};

/**
 * The linear scale of {@link createToY} without the clamp: a value above `yMax`
 * maps above the plot, so that a line drawn through it under a clip path leaves
 * the plot at its true slope instead of running along the top.
 */
export const createUnclampedLinearToY =
  (plotH: number, yMax: number): ((v: number) => number) =>
  (v: number): number =>
    // eslint-disable-next-line total-functions/no-partial-division
    plotH - (v / yMax) * plotH;

const niceStep = (max: number, targetTicks: number): number => {
  // eslint-disable-next-line total-functions/no-partial-division
  const raw = max / targetTicks;

  const magnitude = 10 ** Math.floor(Math.log10(raw));

  // eslint-disable-next-line total-functions/no-partial-division
  const normalized = raw / magnitude;

  const nice =
    normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10;

  return nice * magnitude;
};
