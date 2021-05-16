import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { Cons } from './cons';
import type { First } from './first';
import type { Rest } from './rest';
import type { Reverse } from './reverse';

export type Concat<
  A extends unknown[],
  B extends unknown[],
  R extends unknown[] = []
> = {
  0: Reverse<R>;
  1: Concat<Rest<A>, B, Cons<First<A>, R>>;
  2: Concat<A, Rest<B>, Cons<First<B>, R>>;
}[A extends [] ? (B extends [] ? 0 : 2) : 1];

assertType<TypeEq<Concat<[], []>, []>>();
assertType<TypeEq<Concat<[1, 2], []>, [1, 2]>>();
assertType<TypeEq<Concat<[], [1, 2]>, [1, 2]>>();
assertType<TypeEq<Concat<[1, 2], [3, 4, 5]>, [1, 2, 3, 4, 5]>>();
