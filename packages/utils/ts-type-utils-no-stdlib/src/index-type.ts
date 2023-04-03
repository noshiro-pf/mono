import { type RelaxedExclude } from './aliases';
import { type IndexOfTuple } from './index-of-tuple';
import { type MakeTuple } from './make-tuple';

export type Index<N extends number> = IndexOfTuple<MakeTuple<unknown, N>>;

type ToNumberFromNegative<S extends `-${number}`> =
  S extends `${infer N extends number}` ? N : never;

type MapIdx<I extends number> = I extends I
  ? ToNumberFromNegative<`-${I}`>
  : never;

export type NegativeIndex<N extends number> = MapIdx<
  RelaxedExclude<Index<N>, 0>
>;
