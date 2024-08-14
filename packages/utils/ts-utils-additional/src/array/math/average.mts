import { Arr, Num, toFiniteNumber } from '@noshiro/ts-utils';

export const average = (array: readonly number[]): number =>
  Arr.isNonEmpty(array)
    ? Num.div(toFiniteNumber(Arr.sum(array)), Arr.length(array))
    : 0;
