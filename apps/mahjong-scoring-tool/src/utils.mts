import { Arr } from 'ts-data-forge';

export const average = (array: readonly number[]): number =>
  Arr.isEmpty(array)
    ? 0
    : // eslint-disable-next-line total-functions/no-partial-division
      Arr.sum(array) / array.length;
