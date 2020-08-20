import { assertType, TypeEq } from '../test-type';

export type Cons<X, XS extends any[]> = ((h: X, ...args: XS) => void) extends (
  ...args: infer R
) => void
  ? R
  : [];

assertType<TypeEq<Cons<10, []>, [10]>>();
assertType<TypeEq<Cons<10, [1]>, [10, 1]>>();
assertType<TypeEq<Cons<10, [1, 2, 3]>, [10, 1, 2, 3]>>();
