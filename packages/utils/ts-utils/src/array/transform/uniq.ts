import { NonEmptyArray, ReadonlyNonEmptyArray } from '../non-empty-array';

/**
 * @desc copy and return unique array
 * @param arr target array
 * @param mapFn perform identity check after mapping by the map function
 */
export function uniq<T>(arr: ReadonlyNonEmptyArray<T>): NonEmptyArray<T>;
export function uniq<T>(arr: readonly T[]): T[];
export function uniq<T>(arr: readonly T[]): T[] {
  return Array.from(new Set(arr));
}

export function uniqBy<A, B>(
  arr: ReadonlyNonEmptyArray<A>,
  mapFn: (value: A) => B
): NonEmptyArray<A>;
export function uniqBy<A, B>(arr: readonly A[], mapFn: (value: A) => B): A[];
export function uniqBy<A, B>(arr: readonly A[], mapFn: (value: A) => B): A[] {
  const mappedValues = new Set();
  return arr.filter((val) => {
    const mappedValue = mapFn(val);
    if (mappedValues.has(mappedValue)) return false;
    mappedValues.add(mappedValue);
    return true;
  });
}
