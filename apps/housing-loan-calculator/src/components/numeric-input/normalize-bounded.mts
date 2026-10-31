import { Num } from 'ts-data-forge';

/**
 * The number a numeric input of the page commits for `n`: clamped to
 * `[min, max]`, rounded to a whole number for `integer`, and `min` for a
 * number that is not finite, as the `NaN` of text that is no number.
 */
export const normalizeBounded =
  ({
    min,
    max,
    integer,
  }: Readonly<{
    min: number;
    max: number;
    integer: boolean;
  }>) =>
  (n: number): number =>
    Num.clamp(integer ? Math.round(n) : n, min, max);
