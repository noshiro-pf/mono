import { ReadonlyNonEmptyArray } from '../non-empty-array';
import { at } from './at';

interface Last {
  <T>(array: ReadonlyNonEmptyArray<T>): T;
  <T>(array: readonly T[]): T | undefined;
}

export const last: Last = <T>(array: readonly T[]): T | undefined =>
  at(array, array.length - 1);
