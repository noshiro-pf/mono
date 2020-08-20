import { ReadonlyNonEmptyArray } from '../non-empty-array';
import { at } from './at';

interface First {
  <T>(array: ReadonlyNonEmptyArray<T>): T;
  <T>(array: readonly T[]): T | undefined;
}

export const first: First = <T>(
  array: ReadonlyNonEmptyArray<T> | readonly T[]
): T | undefined => at(array, 0);
