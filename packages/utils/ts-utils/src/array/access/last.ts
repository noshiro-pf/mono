import type { uint32 } from '../../types';
import type { ReadonlyNonEmptyArray } from '../non-empty-array';
import { at } from './at';

export function last<T>(array: ReadonlyNonEmptyArray<T>): T;
export function last<T>(array: readonly T[]): T | undefined;
export function last<T>(array: readonly T[]): T | undefined {
  return at(array, (array.length - 1) as uint32);
}
