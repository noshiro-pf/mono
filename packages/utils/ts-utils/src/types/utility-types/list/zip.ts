import { assertType, TypeEq } from '../test-type';
import { Cons } from './cons';
import { First } from './first';
import { Rest } from './rest';
import { Reverse } from './reverse';

export type Zip<
  A extends unknown[],
  B extends unknown[],
  R extends unknown[] = []
> = {
  0: Reverse<R>;
  1: Zip<Rest<A>, Rest<B>, Cons<[First<A>, First<B>], R>>;
}[A extends [] ? 0 : B extends [] ? 0 : 1];

assertType<TypeEq<Zip<[], []>, []>>();
assertType<TypeEq<Zip<[1], []>, []>>();
assertType<TypeEq<Zip<[], [1]>, []>>();
assertType<TypeEq<Zip<[1, 2, 3], [4, 5]>, [[1, 4], [2, 5]]>>();
