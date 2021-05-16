import type { uint32 } from '../../types';
import { isEmpty } from '../is-empty';
import type { ReadonlyNonEmptyArray } from '../non-empty-array';

export function max(array: ReadonlyNonEmptyArray<uint32>): uint32;
export function max(array: readonly uint32[]): uint32 | undefined;
export function max(array: ReadonlyNonEmptyArray<number>): number;
export function max(array: readonly number[]): number | undefined;
export function max(array: readonly number[]): number | undefined {
  return isEmpty(array) ? undefined : Math.max.apply(null, array as number[]);
}
