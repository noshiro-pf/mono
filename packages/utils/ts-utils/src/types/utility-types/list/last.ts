import { assertType, TypeEq } from '../test-type';
import { First } from './first';
import { Rest } from './rest';

export type Last<T extends unknown[]> = {
  0: never;
  1: First<T>;
  2: Last<Rest<T>>;
}[T extends [] ? 0 : T extends [unknown] ? 1 : 2];

assertType<TypeEq<Last<[]>, never>>();
assertType<TypeEq<Last<[1]>, 1>>();
assertType<TypeEq<Last<[1, 2, 3]>, 3>>();
