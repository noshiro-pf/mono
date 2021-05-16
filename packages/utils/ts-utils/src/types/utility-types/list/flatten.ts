import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { Cons } from './cons';
import type { First } from './first';
import type { Rest } from './rest';
import type { Reverse } from './reverse';

export type Flatten<
  T extends unknown[][],
  R1 extends unknown[] = [],
  R2 extends unknown[] = []
> = {
  0: Reverse<R2>;
  1: Flatten<Rest<T>, First<T, []>, R2>;
  2: Flatten<T, Rest<R1>, Cons<First<R1>, R2>>;
}[T extends [] ? (R1 extends [] ? 0 : 2) : R1 extends [] ? 1 : 2];

assertType<TypeEq<Flatten<[]>, []>>();
assertType<TypeEq<Flatten<[[]]>, []>>();
assertType<TypeEq<Flatten<[[1, 2], [], [3]]>, [1, 2, 3]>>();
assertType<TypeEq<Flatten<[[1, 2], [3]]>, [1, 2, 3]>>();
assertType<TypeEq<Flatten<[[1, 2], [3], []]>, [1, 2, 3]>>();
assertType<TypeEq<Flatten<[[], [1, 2], [3]]>, [1, 2, 3]>>();
