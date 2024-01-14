type UintRange<Start extends number, End extends number> = RelaxedExclude<
  Index<End>,
  Index<Start>
>;

type IndexInclusive<N extends number> = IndexOfTuple<[...MakeTuple<0, N>, 0]>;

type UintRangeInclusive<
  MinValue extends number,
  MaxValue extends number,
> = RelaxedExclude<IndexInclusive<MaxValue>, Index<MinValue>>;
