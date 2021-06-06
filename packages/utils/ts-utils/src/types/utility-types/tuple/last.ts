import type { TypeEq } from '../test-type';
import { assertType } from '../test-type';
import type { TupleHead } from './head';
import type { TupleTail } from './tail';

export type TupleLast<T extends readonly unknown[]> = T extends readonly []
  ? never
  : T extends readonly [unknown]
  ? TupleHead<T>
  : TupleLast<TupleTail<T>>;

assertType<TypeEq<TupleLast<[]>, never>>();
assertType<TypeEq<TupleLast<[1]>, 1>>();
assertType<TypeEq<TupleLast<[1, 2, 3]>, 3>>();

assertType<TypeEq<TupleLast<readonly []>, never>>();
assertType<TypeEq<TupleLast<readonly [1]>, 1>>();
assertType<TypeEq<TupleLast<readonly [1, 2, 3]>, 3>>();
