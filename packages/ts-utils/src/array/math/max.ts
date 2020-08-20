import { isEmpty } from '../is-empty';
import { ReadonlyNonEmptyArray } from '../non-empty-array';

interface Max {
  (array: ReadonlyNonEmptyArray<number>): number;
  (array: readonly number[]): number | undefined;
}

export const max: Max = ((array: readonly number[]): number | undefined =>
  isEmpty(array) ? undefined : Math.max.apply(null, array as number[])) as Max;
