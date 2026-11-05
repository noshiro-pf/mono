import { Num } from 'ts-data-forge';

/** The bounds, precision and fallback of a numeric setting. */
export type NumericTypeProperties<N extends number> = Readonly<{
  min: N;
  max: N;
  /** The number of decimal places kept. */
  digit: number;
  /** What a number that is not finite becomes. */
  defaultValue: N;
}>;

/**
 * Clamps a number to `min` and `max` and rounds it to `digit` decimal places,
 * which is what makes it an `N`; a number that is not finite becomes
 * `defaultValue`.
 */
export const clampAndRoundFn =
  <N extends number>(p: NumericTypeProperties<N>) =>
  (x: number): N => {
    if (!Number.isFinite(x)) {
      return p.defaultValue;
    }

    if (x < p.min) {
      return p.min;
    }

    if (p.max < x) {
      return p.max;
    }

    const scale = 10 ** p.digit;

    // Rounding that cannot be done in floating point (a scale that is zero or
    // not finite, or a product that overflows) leaves the number as it is.
    const rounded = Num.isNonZero(scale)
      ? Num.div(Math.round(x * scale), scale)
      : Number.NaN;

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- within the bounds, rounded where it can be, which is all `N` asks
    return (Number.isFinite(rounded) ? rounded : x) as N;
  };
