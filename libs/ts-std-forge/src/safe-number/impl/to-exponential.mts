import { type UintRangeInclusive } from 'ts-type-forge';

/**
 * Formats a number in exponential notation, made total by its parameter
 * type.
 *
 * `Number.prototype.toExponential` throws a `RangeError` only when
 * `fractionDigits` is outside 0–100 (and `value` is finite). With
 * `fractionDigits` typed as the `0 | 1 | ... | 100` literal range, that
 * failure is unrepresentable at compile time, so the function returns the
 * string directly. When `fractionDigits` is omitted, as many digits as
 * necessary are used. A caller holding a plain `number` narrows it first;
 * one that defeats the type system gets the raw `RangeError`, by design.
 *
 * @example
 *
 * ```ts
 * assert.deepStrictEqual(SafeNumber.toExponential(123456, 2), '1.23e+5');
 * ```
 *
 * @param value The number to format.
 * @param fractionDigits Optional number of digits after the decimal point
 *   (0–100 inclusive). Omitted means as many digits as necessary.
 * @returns The exponential representation.
 */
export const toExponential = (
  value: number,
  fractionDigits?: UintRangeInclusive<0, 100>,
): string => value.toExponential(fractionDigits);
