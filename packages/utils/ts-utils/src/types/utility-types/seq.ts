import type { IndexOfTuple } from './index-of-tuple';
import type { MakeTuple } from './make-tuple';
import { assertType } from './test-type';

export type Seq<N extends number> = IndexOfTuple<MakeTuple<unknown, N>>;

assertType<TypeEq<Seq<3>, 0 | 1 | 2>>();
assertType<TypeEq<Seq<0>, never>>();
assertType<TypeEq<Seq<1.2>, never>>();
assertType<TypeEq<Seq<5>, 0 | 1 | 2 | 3 | 4>>();
