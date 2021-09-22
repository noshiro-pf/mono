import { assertType } from '../test-type';
import type { TupleTail } from '../tuple';

export type TupleToString<U extends readonly string[]> = U['length'] extends 0
  ? ''
  : `${U[0]}${TupleToString<TupleTail<U>>}`;

assertType<TypeEq<TupleToString<['A', 'B', 'C']>, 'ABC'>>();
assertType<TypeEq<TupleToString<[]>, ''>>();
assertType<TypeEq<TupleToString<['A']>, 'A'>>();
