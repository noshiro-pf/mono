import type { TypeEq } from '../types';
import { assertType } from '../types';

export const copy = <T extends readonly unknown[]>(array: T): T =>
  array.slice() as unknown as T;

const ar = [1, 2, 3] as const;
const ar2 = copy(ar);

assertType<TypeEq<typeof ar2, readonly [1, 2, 3]>>();
