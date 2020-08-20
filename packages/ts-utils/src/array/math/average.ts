import { isEmpty } from '../is-empty';
import { sum } from './sum';

export const average = (array: readonly number[]): number =>
  isEmpty(array) ? 0 : sum(array) / array.length;
