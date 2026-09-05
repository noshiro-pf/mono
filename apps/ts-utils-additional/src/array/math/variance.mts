import {
  Arr,
  Num,
  asFiniteNumber,
  asNonNegativeFiniteNumber,
  asPositiveFiniteNumber,
} from 'ts-data-forge';
import {
  type NonEmptyArray,
  type NonNegativeFiniteNumber,
} from 'ts-type-forge';

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

  return Num.isNonZero(len)
    ? asNonNegativeFiniteNumber(
        Num.div(asFiniteNumber(sqSum(list)), len) -
          Num.div(
            asFiniteNumber(Arr.sum(list) ** 2),
            asPositiveFiniteNumber(len ** 2),
          ),
      )
    : undefined;
}
