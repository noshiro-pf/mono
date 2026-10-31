import { Num } from 'ts-data-forge';

/**
 * `(1 - (1 + rate) ** -count) / rate`, what `count` payments of 1 are worth at
 * `rate` a payment, and `count`, its limit, at a rate of 0.
 *
 * Written as it reads, it cancels to nothing at small rates: at a monthly rate
 * of 1e-16, `1 + rate` is already 1 in a double, and the formula divides by
 * zero. Through `log1p` and `expm1` it keeps its precision down to the smallest
 * rate.
 */
export const annuityFactor = (rate: number, count: number): number =>
  Num.isNonZero(rate)
    ? Num.div(-Math.expm1(-count * Math.log1p(rate)), rate)
    : count;
