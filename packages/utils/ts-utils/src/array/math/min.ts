import type { uint32 } from '../../types';
import { isEmpty } from '../is-empty';
import type { ReadonlyNonEmptyArray } from '../non-empty-array';

export function min(array: ReadonlyNonEmptyArray<uint32>): uint32;
export function min(array: readonly uint32[]): uint32 | undefined;
export function min(array: ReadonlyNonEmptyArray<number>): number;
export function min(array: readonly number[]): number | undefined;
export function min(array: readonly number[]): number | undefined {
  return isEmpty(array) ? undefined : Math.min.apply(null, array as number[]);
}
