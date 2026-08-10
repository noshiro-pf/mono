type Index<N extends number> = IndexOfTuple<MakeTuple<0, N>>;

type IndexInclusive<N extends number> = IndexOfTuple<[...MakeTuple<0, N>, 0]>;

type NegativeIndex<N extends number> = TSTypeUtilsInternals.MapIdx<
  RelaxedExclude<IndexInclusive<N>, 0>
>;

/** @internal */
declare namespace TSTypeUtilsInternals {
  type NegativeToNumber<S extends `-${number}`> =
    S extends `${infer N extends number}` ? N : never;

  type MapIdx<I extends number> = I extends I
    ? NegativeToNumber<`-${I}`>
    : never;
}
