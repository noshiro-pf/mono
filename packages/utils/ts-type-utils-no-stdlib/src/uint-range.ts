import { type IndexOfTuple } from './index-of-tuple';
import { type Index } from './index-type';
import { type MakeTuple } from './make-tuple';
import { type RelaxedExclude } from './utils';

export type UintRange<Min extends number, Max extends number> = RelaxedExclude<
  SeqPlus1<Max>,
  Index<Min>
>;

type SeqPlus1<N extends number> = IndexOfTuple<
  [...MakeTuple<unknown, N>, unknown]
>;
