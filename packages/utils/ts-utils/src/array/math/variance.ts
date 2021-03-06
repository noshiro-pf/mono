import { sum } from './sum';

export const sqsum = (list: readonly number[]): number =>
  list.reduce((a, b) => a + b ** 2, 0);

export const variance = (list: readonly number[]): number | undefined =>
  list.length === 0
    ? undefined
    : sqsum(list) / list.length - sum(list) ** 2 / list.length ** 2;
