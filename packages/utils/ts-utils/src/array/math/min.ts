import { isEmpty } from '../is-empty';
import { ReadonlyNonEmptyArray } from '../non-empty-array';

// export function
export function min(array: ReadonlyNonEmptyArray<number>): number;
export function min(array: readonly number[]): number | undefined;
export function min(array: readonly number[]): number | undefined {
  return isEmpty(array) ? undefined : Math.min.apply(null, array as number[]);
}
