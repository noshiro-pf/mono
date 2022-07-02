import type { RelaxedExclude } from './aliases';
import type { IndexOfTuple } from './index-of-tuple';
import type { MakeTuple } from './make-tuple';
import type { Seq } from './seq';

export type UintRange<Min extends number, Max extends number> = RelaxedExclude<
  SeqPlus1<Max>,
  Seq<Min>
>;

type SeqPlus1<N extends number> = IndexOfTuple<
  [...MakeTuple<unknown, N>, unknown]
>;
