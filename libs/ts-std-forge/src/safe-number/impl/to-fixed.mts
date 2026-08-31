import { type UintRangeInclusive } from 'ts-type-forge';

/**
 * Formats a number in fixed-point notation, made total by its parameter
 * type.
 *
 * `Number.prototype.toFixed` throws a `RangeError` only when
 * `fractionDigits` is outside 0–100. With `fractionDigits` typed as the
 * `0 | 1 | ... | 100` literal range (the same refinement the strict TS lib
 * applies), that failure is unrepresentable at compile time, so the function
 * returns the string directly. A caller holding a plain `number` narrows it
 * first (truncating explicitly with `Math.trunc` if it may be fractional);
 * one that defeats the type system gets the raw `RangeError`, by design.
 *
 * @example
 *
 * ```ts
 * assert.deepStrictEqual(SafeNumber.toFixed(1.005, 2), '1.00');
 * ```
 *
 * @param value The number to format.
 * @param fractionDigits The number of digits after the decimal point (0–100
 *   inclusive).
 * @returns The fixed-point representation.
 */
export const toFixed = (
  value: number,
  fractionDigits: UintRangeInclusive<0, 100>,
): string => value.toFixed(fractionDigits);
