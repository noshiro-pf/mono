import { assertType } from '../test-type';
import type { TupleHead } from '../tuple';

export type ListHead<T extends readonly unknown[], D = never> = TupleHead<T, D>;

assertType<TypeEq<ListHead<[]>, never>>();
assertType<TypeEq<ListHead<number[]>, never>>();
assertType<TypeEq<ListHead<[number, ...number[]], 0>, number>>();
assertType<TypeEq<ListHead<number[], 1>, 1>>();

assertType<TypeEq<ListHead<readonly []>, never>>();
assertType<TypeEq<ListHead<readonly number[]>, never>>();
assertType<
  TypeEq<ListHead<readonly [number, ...(readonly number[])], 0>, number>
>();
assertType<TypeEq<ListHead<readonly number[], 1>, 1>>();
