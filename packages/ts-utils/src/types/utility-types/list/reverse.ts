import { assertType, TypeEq } from '../test-type';
import { Cons } from './cons';
import { First } from './first';
import { Rest } from './rest';

export type Reverse<L extends any[], X extends any[] = []> = {
  1: X;
  0: Reverse<Rest<L>, Cons<First<L>, X>>;
}[L extends [] ? 1 : 0];

assertType<TypeEq<Reverse<[]>, []>>();
assertType<TypeEq<Reverse<[1]>, [1]>>();
assertType<TypeEq<Reverse<[1, 2, 3]>, [3, 2, 1]>>();
