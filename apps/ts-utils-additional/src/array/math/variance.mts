import {
  Arr,
  Num,
  asFiniteNumber,
  asNonNegativeFiniteNumber,
} from 'ts-data-forge';
import type { NonEmptyArray, NonNegativeFiniteNumber } from 'ts-type-forge';

export const sqSum = (list: readonly number[]): number =>
  list.reduce((a, b) => a + b ** 2, 0);

export function variance(list: NonEmptyArray<number>): NonNegativeFiniteNumber;

export function variance(
  list: readonly number[],
): NonNegativeFiniteNumber | undefined;

export function variance(
  list: readonly number[],
): NonNegativeFiniteNumber | undefined {
  const len = Arr.length(list);

  if (!Num.isNonZero(len)) {
    return undefined;
  }

  // Two passes (the mean, then the mean squared deviation) rather than
  // E[x²] − E[x]², which cancels catastrophically for (nearly) equal values and
  // can round below 0.
  const mean = Num.div(asFiniteNumber(Arr.sum(list)), len);

  return asNonNegativeFiniteNumber(
    Num.div(asFiniteNumber(sqSum(list.map((x) => x - mean))), len),
  );
}
