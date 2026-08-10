import { expectType } from '@noshiro/ts-utils';

export type TupleToString<U extends readonly string[]> = U['length'] extends 0
  ? ''
  : `${U[0]}${TupleToString<Tuple.Tail<U>>}`;

expectType<TupleToString<['A', 'B', 'C']>, 'ABC'>('=');
expectType<TupleToString<[]>, ''>('=');
expectType<TupleToString<['A']>, 'A'>('=');
