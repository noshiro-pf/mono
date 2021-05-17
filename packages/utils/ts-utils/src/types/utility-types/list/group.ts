import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { Cons } from './cons';
import type { First } from './first';
import type { Rest } from './rest';
import type { Reverse } from './reverse';

export type Group<
  N extends number,
  T extends unknown[],
  R1 extends unknown[] = [],
  R2 extends unknown[] = []
> = {
  0: Reverse<R2>;
  1: Group<N, T, [], Cons<Reverse<R1>, R2>>;
  2: Group<N, Rest<T>, Cons<First<T>, R1>, R2>;
}[T extends [] ? (R1 extends [] ? 0 : 1) : R1['length'] extends N ? 1 : 2];

assertType<TypeEq<Group<1, []>, []>>();
assertType<TypeEq<Group<2, [1, 2, 3]>, [[1, 2], [3]]>>();
assertType<TypeEq<Group<3, [1, 2, 3]>, [[1, 2, 3]]>>();
assertType<TypeEq<Group<2, [1, 2, 3, 4]>, [[1, 2], [3, 4]]>>();
