type UintRange<Start extends number, End extends number> = RelaxedExclude<
  Index<End>,
  Index<Start>
>;

type UintRangeInclusive<
  MinValue extends number,
  MaxValue extends number,
> = RelaxedExclude<IndexInclusive<MaxValue>, Index<MinValue>>;
