import { Arr } from 'ts-data-forge';

export const sum = (array: readonly number[]): number => Arr.sum(array);

export const average = (array: readonly number[]): number =>
  Arr.isEmpty(array)
    ? 0
    : // eslint-disable-next-line total-functions/no-partial-division
      sum(array) / array.length;

export const count = <T,>(
  array: readonly T[],
  predicate: (value: T, index: number) => boolean,
): number => {
  let mut_n = 0;

  for (const [index, s] of array.entries()) {
    if (predicate(s, index)) {
      mut_n += 1;
    }
  }

  return mut_n;
};
