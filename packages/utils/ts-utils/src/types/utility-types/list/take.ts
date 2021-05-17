import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { Cons } from './cons';
import type { First } from './first';
import type { Rest } from './rest';
import type { Reverse } from './reverse';

export type Take<
  N extends number,
  T extends unknown[],
  R extends unknown[] = []
> = {
  0: Reverse<R>;
  1: Take<N, Rest<T>, Cons<First<T>, R>>;
}[T extends [] ? 0 : R['length'] extends N ? 0 : 1];

assertType<TypeEq<Take<2, []>, []>>();
assertType<TypeEq<Take<2, [1, 2]>, [1, 2]>>();
assertType<TypeEq<Take<2, [1, 2, 3]>, [1, 2]>>();
assertType<TypeEq<Take<0, [1, 2, 3]>, []>>();
