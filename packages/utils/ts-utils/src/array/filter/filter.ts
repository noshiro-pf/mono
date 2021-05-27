import type { TypeEq } from '../../types';
import { assertType } from '../../types';

export function filter<T, S extends T>(
  array: readonly T[],
  predicate: (value: T, index: number) => value is S
): S[];
export function filter<T>(
  array: readonly T[],
  predicate: (value: T, index: number) => boolean
): T[];
export function filter<T>(
  array: readonly T[],
  predicate: (value: T, index: number) => boolean
): T[] {
  return array.filter(predicate);
}

{
  const a = [1, 2, 3] as const;
  const r = filter(a, (x): x is 1 => x === 1);
  assertType<TypeEq<typeof r, 1[]>>();
}
