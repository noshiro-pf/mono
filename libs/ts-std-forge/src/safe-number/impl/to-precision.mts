import { type UintRangeInclusive } from 'ts-type-forge';

/**
 * Formats a number to a given precision, made total by its parameter type.
 *
 * `Number.prototype.toPrecision` throws a `RangeError` only when `precision`
 * is outside 1–100 (and `value` is finite). With `precision` typed as the
 * `1 | 2 | ... | 100` literal range, that failure is unrepresentable at
 * compile time, so the function returns the string directly. A caller
 * holding a plain `number` narrows it first; one that defeats the type
 * system gets the raw `RangeError`, by design.
 *
 * @example
 *
 * ```ts
 * assert.deepStrictEqual(SafeNumber.toPrecision(123.456, 4), '123.5');
 * ```
 *
 * @param value The number to format.
 * @param precision The number of significant digits (1–100 inclusive).
 * @returns The formatted representation.
 */
export const toPrecision = (
  value: number,
  precision: UintRangeInclusive<1, 100>,
): string => value.toPrecision(precision);
