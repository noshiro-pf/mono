import { Num } from 'ts-data-forge';
import type { NonZeroNumber, SmallInt } from 'ts-type-forge';

/**
 * `(1 - (1 + rate) ** -count) / rate`, what `count` payments of 1 are worth at
 * `rate` a payment, and `count`, its limit, at a rate of 0.
 *
 * Written as it reads, it cancels to nothing at small rates: at a rate of
 * 1e-16, `1 + rate` is already 1 in a double, and the formula divides by zero;
 * just above that, the rounding of `1 + rate` puts it off by up to a quarter.
 * Through `log1p` and `expm1` it keeps its precision down to the smallest rate.
 */
export const annuityFactor = (rate: number, count: number): number =>
  Num.isNonZero(rate)
    ? Num.div(-Math.expm1(-count * Math.log1p(rate)), rate)
    : count;

/**
 * `((1 + rate) ** count - 1) / rate`, what `count` payments of 1 have grown to
 * at `rate` a payment by the last one, and `count`, its limit, at a rate of 0.
 * Computed through `log1p` and `expm1` for the reason {@link annuityFactor} is.
 */
export const accumulationFactor = (rate: number, count: number): number =>
  Num.isNonZero(rate)
    ? Num.div(Math.expm1(count * Math.log1p(rate)), rate)
    : count;

/**
 * `(1 + rate) ** (1 / periods) - 1`: the rate a period that, compounded over
 * `periods` periods, comes to `rate` — a yearly rate turned monthly with 12.
 * Written as it reads it loses the relative precision of a small `rate` to the
 * rounding of `1 + rate`; `expm1(log1p(rate) / periods)` keeps it.
 */
export const periodRateOf = (
  rate: number,
  periods: NonZeroNumber | SmallInt<'!=0'>,
): number => Math.expm1(Num.div(Math.log1p(rate), periods));
