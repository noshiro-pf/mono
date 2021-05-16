import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { Cons } from './cons';
import type { First } from './first';
import type { Rest } from './rest';

export type Reverse<L extends unknown[], X extends unknown[] = []> = {
  1: X;
  0: Reverse<Rest<L>, Cons<First<L>, X>>;
}[L extends [] ? 1 : 0];

assertType<TypeEq<Reverse<[]>, []>>();
assertType<TypeEq<Reverse<[1]>, [1]>>();
assertType<TypeEq<Reverse<[1, 2, 3]>, [3, 2, 1]>>();
