import { isEmpty } from '../is-empty';
import { ReadonlyNonEmptyArray } from '../non-empty-array';

export function max(array: ReadonlyNonEmptyArray<number>): number;
export function max(array: readonly number[]): number | undefined;
export function max(array: readonly number[]): number | undefined {
  return isEmpty(array) ? undefined : Math.max.apply(null, array as number[]);
}
