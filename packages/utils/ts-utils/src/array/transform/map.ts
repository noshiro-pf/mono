import type { uint32 } from '../../types';

export const map = <A, B>(mapFn: (a: A, index: uint32) => B) => <
  T extends readonly A[]
>(
  array: T
): { [K in keyof T]: B } =>
  (array.map(mapFn as (a: A, index: number) => B) as unknown) as {
    [K in keyof T]: B;
  };
