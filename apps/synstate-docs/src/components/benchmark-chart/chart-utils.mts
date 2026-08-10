/** Shared utilities for benchmark chart components. */

import { Arr, asPositiveSafeInt, PositiveSafeInt } from 'ts-data-forge';

export const formatTickLabel = (v: number): string => {
  if (v >= 1000) return `${String(v / 1000)}s`;

  if (v < 1) return v.toFixed(1);

  return String(Math.round(v));
};

export const generateLinearTicks = (
  max: PositiveSafeInt,
): readonly number[] => {
  const step = niceStep(max, 5);

  return Arr.range(step, PositiveSafeInt.add(max, step), step);
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

      if (v >= min && v <= max) {
        mut_ticks.push(v);
      }
    }

    mut_power += 1;
  }

  return mut_ticks;
};

const niceStep = (max: number, targetTicks: number): PositiveSafeInt => {
  // eslint-disable-next-line total-functions/no-partial-division
  const raw = max / targetTicks;

  const magnitude = asPositiveSafeInt(10 ** Math.floor(Math.log10(raw)));

  // eslint-disable-next-line total-functions/no-partial-division
  const normalized = raw / magnitude;

  const nice =
    normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10;

  return PositiveSafeInt.mul(nice, magnitude);
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

  return (v: number): number => {
    const clamped = Math.min(v, yMax);

    // eslint-disable-next-line total-functions/no-partial-division
    return plotH - (clamped / yMax) * plotH;
  };
};
