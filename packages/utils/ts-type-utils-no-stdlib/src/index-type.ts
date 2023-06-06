import { type IndexOfTuple } from './index-of-tuple';
import { type MakeTuple } from './make-tuple';
import { type RelaxedExclude } from './utils';

export type Index<N extends number> = IndexOfTuple<MakeTuple<0, N>>;

export type NegativeIndex<N extends number> = _NegativeIndexImpl.MapIdx<
  RelaxedExclude<IndexOfTuple<[0, ...MakeTuple<0, N>]>, 0>
>;

/** @internal */
namespace _NegativeIndexImpl {
  /** @internal */
  type ToNumberFromNegative<S extends `-${number}`> =
    S extends `${infer N extends number}` ? N : never;

  /** @internal */
  export type MapIdx<I extends number> = I extends I
    ? ToNumberFromNegative<`-${I}`>
    : never;
}
