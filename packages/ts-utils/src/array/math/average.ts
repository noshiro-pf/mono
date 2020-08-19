import { isEmpty } from '../is-empty';
import { sum } from './sum';

export const average = (arr: readonly number[]): number =>
  isEmpty(arr) ? 0 : sum(arr) / arr.length;
