import { assertType, TypeEq } from '../types';

export const copy = <T extends readonly unknown[]>(array: T): T =>
  (array.slice() as unknown) as T;

const array = [1, 2, 3] as const;
const array2 = copy(array);

assertType<TypeEq<typeof array2, readonly [1, 2, 3]>>();
