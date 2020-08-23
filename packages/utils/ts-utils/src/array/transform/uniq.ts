import { ReadonlyNonEmptyArray } from '../non-empty-array';

interface UniqType {
  <T>(arr: ReadonlyNonEmptyArray<T>): ReadonlyNonEmptyArray<T>;
  <T>(arr: readonly T[]): T[];
}

/**
 * @desc copy and return unique array
 * @param arr target array
 * @param mapFn perform identity check after mapping by the map function
 */
export const uniq: UniqType = (<T>(arr: readonly T[]): T[] =>
  Array.from(new Set(arr))) as UniqType;

interface UniqByType<A> {
  (arr: ReadonlyNonEmptyArray<A>): ReadonlyNonEmptyArray<A>;
  (arr: readonly A[]): A[];
}

export const uniqBy = <A, B>(mapFn: (value: A) => B): UniqByType<A> =>
  ((arr: readonly A[]): A[] => {
    const mappedValues = new Set();
    return arr.filter((val) => {
      const mappedValue = mapFn(val);
      if (mappedValues.has(mappedValue)) return false;
      mappedValues.add(mappedValue);
      return true;
    });
  }) as UniqByType<A>;
