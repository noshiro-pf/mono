import { DAY_MS, HOUR_MS } from './format.mjs';

/**
 * A lag as the editor shows it: whole days, and the hours left over (which
 * may have a fraction). A lead — a negative lag — has both parts negative.
 */
export const lagToParts = (lagMs: number): LagParts => {
  const days = Math.trunc(lagMs / DAY_MS);

  return {
    days: days === 0 ? 0 : days,
    hours: (lagMs - days * DAY_MS) / HOUR_MS + 0,
  };
};

/** The lag in milliseconds, rounded to the millisecond. */
export const lagFromParts = (days: number, hours: number): number =>
  Math.round(days * DAY_MS + hours * HOUR_MS);

export type LagParts = Readonly<{
  days: number;
  hours: number;
}>;
