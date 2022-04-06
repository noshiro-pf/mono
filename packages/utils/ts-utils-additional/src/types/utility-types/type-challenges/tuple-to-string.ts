import { assertType } from '@noshiro/ts-utils';

export type TupleToString<U extends readonly string[]> = U['length'] extends 0
  ? ''
  : `${U[0]}${TupleToString<Tuple.Tail<U>>}`;

assertType<TypeEq<TupleToString<['A', 'B', 'C']>, 'ABC'>>();
assertType<TypeEq<TupleToString<[]>, ''>>();
assertType<TypeEq<TupleToString<['A']>, 'A'>>();
