import {
  Arr,
  Num,
  toFiniteNumber,
  toNonNegativeFiniteNumber,
  toPositiveFiniteNumber,
} from '@noshiro/ts-utils';

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
    ? toNonNegativeFiniteNumber(
        Num.div(toFiniteNumber(sqSum(list)), len) -
          Num.div(
            toFiniteNumber(Arr.sum(list) ** 2),
            toPositiveFiniteNumber(len ** 2),
          ),
      )
    : undefined;
}
