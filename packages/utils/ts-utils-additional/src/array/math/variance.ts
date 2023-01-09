import { Arr } from '@noshiro/ts-utils';

export const sqSum = (list: readonly number[]): number =>
  list.reduce((a, b) => a + b ** 2, 0);

export const variance = (list: readonly number[]): number | undefined =>
  list.length === 0
    ? undefined
    : sqSum(list) / list.length - Arr.sum(list) ** 2 / list.length ** 2;
