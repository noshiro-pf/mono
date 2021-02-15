import { ReadonlyNonEmptyArray } from '../non-empty-array';
import { at } from './at';

export function first<T>(array: ReadonlyNonEmptyArray<T>): T;
export function first<T>(array: readonly T[]): T | undefined;
export function first<T>(array: readonly T[]): T | undefined {
  return at(array, 0);
}
