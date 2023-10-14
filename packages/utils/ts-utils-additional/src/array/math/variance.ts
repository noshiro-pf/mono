import { Arr, toNonNegativeFiniteNumber } from '@noshiro/ts-utils';

export const sqSum = (list: readonly number[]): number =>
  list.reduce((a, b) => a + b ** 2, 0);

export function variance(list: NonEmptyArray<number>): NonNegativeFiniteNumber;
export function variance(
  list: readonly number[],
): NonNegativeFiniteNumber | undefined;
export function variance(
  list: readonly number[],
): NonNegativeFiniteNumber | undefined {
  if (list.length === 0) return undefined;
  return toNonNegativeFiniteNumber(
    sqSum(list) / list.length - Arr.sum(list) ** 2 / list.length ** 2,
  );
}
