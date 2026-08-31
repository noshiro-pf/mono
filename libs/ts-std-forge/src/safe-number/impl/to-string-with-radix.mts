import { type UintRangeInclusive } from 'ts-type-forge';

/**
 * Converts a number to a string in a given radix, made total by its
 * parameter type.
 *
 * `Number.prototype.toString` throws a `RangeError` only when `radix` is
 * outside 2–36. With `radix` typed as the `2 | 3 | ... | 36` literal range
 * (the same refinement the strict TS lib applies), that failure is
 * unrepresentable at compile time, so the function returns the string
 * directly. A caller holding a plain `number` narrows it first; one that
 * defeats the type system gets the raw `RangeError`, by design.
 *
 * @example
 *
 * ```ts
 * assert.deepStrictEqual(SafeNumber.toStringWithRadix(255, 16), 'ff');
 * ```
 *
 * @param value The number to convert.
 * @param radix The base to use (2–36 inclusive).
 * @returns The representation in the given radix.
 */
export const toStringWithRadix = (
  value: number,
  radix: UintRangeInclusive<2, 36>,
): string => value.toString(radix);
