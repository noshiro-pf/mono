type Index<N extends number> = IndexOfTuple<MakeTuple<0, N>>;

type NegativeIndex<N extends number> = _NegativeIndexImpl.MapIdx<
  RelaxedExclude<IndexOfTuple<[0, ...MakeTuple<0, N>]>, 0>
>;

/** @internal */
namespace _NegativeIndexImpl {
  /** @internal */
  type ToNumber<S extends `-${number}`> = S extends `${infer N extends number}`
    ? N
    : never;

  /** @internal */
  export type MapIdx<I extends number> = I extends I
    ? ToNumber<`-${I}`>
    : never;
}
