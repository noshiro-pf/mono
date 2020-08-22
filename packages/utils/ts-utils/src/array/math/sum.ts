import { isEmpty } from '../is-empty';

export const sum = (arr: readonly number[]): number =>
  isEmpty(arr) ? 0 : arr.reduce((prev, curr) => prev + curr);
