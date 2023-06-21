import { type IndexOfTuple } from './index-of-tuple';
import { type Index } from './index-type';
import { type MakeTuple } from './make-tuple';
import { type RelaxedExclude } from './utils';

export type UintRange<
  Start extends number,
  End extends number
> = RelaxedExclude<Index<End>, Index<Start>>;

type IndexInclusive<N extends number> = IndexOfTuple<[...MakeTuple<0, N>, 0]>;

export type UintRangeInclusive<
  MinValue extends number,
  MaxValue extends number
> = RelaxedExclude<IndexInclusive<MaxValue>, Index<MinValue>>;
