import { Arr } from '@noshiro/ts-utils';

export const average = (array: readonly number[]): number =>
  Arr.isEmpty(array) ? 0 : Arr.sum(array) / array.length;
