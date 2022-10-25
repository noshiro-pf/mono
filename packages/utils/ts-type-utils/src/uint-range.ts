import type { RelaxedExclude } from './aliases';
import type { IndexOfTuple } from './index-of-tuple';
import type { Index } from './index-type';
import type { MakeTuple } from './make-tuple';

export type UintRange<Min extends number, Max extends number> = RelaxedExclude<
  SeqPlus1<Max>,
  Index<Min>
>;

type SeqPlus1<N extends number> = IndexOfTuple<
  [...MakeTuple<unknown, N>, unknown]
>;
