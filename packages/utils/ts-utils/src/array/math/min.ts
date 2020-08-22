import { isEmpty } from '../is-empty';
import { ReadonlyNonEmptyArray } from '../non-empty-array';

interface Min {
  (array: ReadonlyNonEmptyArray<number>): number;
  (array: readonly number[]): number | undefined;
}

export const min: Min = ((array: readonly number[]): number | undefined =>
  isEmpty(array) ? undefined : Math.min.apply(null, array as number[])) as Min;
