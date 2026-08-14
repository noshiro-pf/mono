import { type FixedLengthTuple } from 'ts-type-forge';

/**
 * Narrows an array to a tuple of exactly `n` elements.
 *
 * `ts-data-forge` used to carry one of these per length
 * (`Arr.isArrayOfLength3` and so on); it no longer does.
 */
export const hasLength = <const N extends number, T>(
  array: readonly T[],
  n: N,
): array is FixedLengthTuple<N, T> => array.length === n;
