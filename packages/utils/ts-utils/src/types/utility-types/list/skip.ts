import { assertType, TypeEq } from '../test-type';
import { Cons } from './cons';
import { First } from './first';
import { Rest } from './rest';

export type Skip<N extends number, T extends any[], R extends any[] = []> = {
  0: T;
  1: Skip<N, Rest<T>, Cons<First<T>, R>>;
}[T extends [] ? 0 : R['length'] extends N ? 0 : 1];

assertType<TypeEq<Skip<0, []>, []>>();
assertType<TypeEq<Skip<1, []>, []>>();
assertType<TypeEq<Skip<0, [1, 2, 3]>, [1, 2, 3]>>();
assertType<TypeEq<Skip<1, [1, 2, 3]>, [2, 3]>>();
assertType<TypeEq<Skip<5, [1, 2, 3]>, []>>();
