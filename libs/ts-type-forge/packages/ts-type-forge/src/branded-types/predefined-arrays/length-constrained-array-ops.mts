import {
  type IsFixedLengthList,
  type IsNever,
  type TypeExtends,
} from '../../condition/index.mjs';
import { type BoolAnd } from '../../others/index.mjs';
import {
  type List,
  type MakeTuple,
  type TSTypeForgeInternals_PinsOneNumber as PinsOneNumber,
} from '../../tuple-and-list/index.mjs';
import { type UintRangeInclusive } from '../../type-level-integer/index.mjs';
import { type SupportedLength } from '../supported-length.mjs';
import {
  type ChangeArrayElement,
  type TSTypeForgeInternals_EffectiveMaxLengthOf as EffectiveMaxLengthOf,
  type TSTypeForgeInternals_EffectiveMinLengthOf as EffectiveMinLengthOf,
  type HasLengthConstraint,
  type LengthConstraintBrandOf,
} from './length-constrained-array-bounds.mjs';
import {
  type BoundedLengthArray,
  type FixedLengthArray,
  type MaxLengthArray,
  type MinLengthArray,
} from './length-constrained-array.mjs';

/**
 * The `List` operations, made aware of the length-constraint brands.
 *
 * `List` decides what it can say about a result from whether the input is a
 * fixed-length tuple. A length-constrained array is not one — its `length` is
 * `number` — so `List` falls back to returning the input type unchanged, which
 * is not merely imprecise but **wrong** for the operations that shorten:
 * `List.Take<2, MinLengthArray<5, E>>` claims the two-element result still has
 * at least five. Every operation here instead recovers the input's bounds from
 * the brand, applies that operation's effect on them, and rebuilds the
 * constraint.
 *
 * For an input with no length-constraint brand each member delegates to its
 * `List` counterpart, so a plain tuple keeps mapping exactly as before.
 *
 * When a value carries *both* — which is the normal shape a ts-data-forge
 * guard produces, since `Arr.isMinLengthArray(3, xs)` narrows to
 * `MinLengthArray<3, E> & Xs` — the result carries both as well. The brand
 * half is recomputed as above, and the tuple half is re-derived by rebuilding
 * the exact tuple and running the plain `List` operation on it, so `Tail` of a
 * branded five-tuple answers a four-element result *and* names its four
 * positions, rather than merely "at least two".
 *
 * The rebuild is what makes this possible at all: `List` cannot be handed the
 * intersection directly, because variadic `infer` does not see through it —
 * `List.Tail` of such a type is `readonly unknown[]`, and `List.Reverse`,
 * `List.SetAt` and `List.Partition` exceed the instantiation limit outright.
 *
 * ## What each member does to the bounds
 *
 * | member                | effect on `(min, max)`               |
 * | :-------------------- | :----------------------------------- |
 * | `Reverse`             | unchanged                            |
 * | `SetAt<I, V>`         | unchanged, element type widened by V |
 * | `Tail`                | `(min - 1, max - 1)`                 |
 * | `ButLast`             | `(min - 1, max - 1)`                 |
 * | `Take<N>`             | `(min(N, min), min(N, max))`         |
 * | `TakeLast<N>`         | `(min(N, min), min(N, max))`         |
 * | `Skip<N>`             | `(min - N, max - N)`                 |
 * | `SkipLast<N>`         | `(min - N, max - N)`                 |
 * | `Concat<A, B>`        | `(minA + minB, maxA + maxB)`         |
 * | `Zip<A, B>`           | `(min(minA, minB), min(maxA, maxB))` |
 * | `Partition<N>`        | each chunk `(1, N)`                  |
 * | `Head` / `Last`       | returns an element, not an array     |
 *
 * Subtraction saturates at `0`, and an absent upper bound stays absent —
 * except under `Take` / `TakeLast`, which impose one. `Concat` and `Zip` are
 * unbounded above as soon as either side is.
 *
 * `Flatten` has deliberately no counterpart; see the note at the end of the
 * namespace for why.
 *
 * @example
 * ```ts
 * type A = ConstrainedList.Take<2, MinLengthArray<5, string>>;
 * // FixedLengthArray<2, string>
 *
 * type B = ConstrainedList.Tail<BoundedLengthArray<2, 5, string>>;
 * // BoundedLengthArray<1, 4, string>
 *
 * type C = ConstrainedList.Take<2, readonly [1, 2, 3]>; // readonly [1, 2]
 *
 * // A brand intersected with a tuple keeps both halves.
 * type Branded = MinLengthArray<3, number> & readonly [1, 2, 3, 4, 5];
 *
 * type D = ConstrainedList.Tail<Branded>;
 * // FixedLengthArray<4, 1 | 2 | 3 | 4 | 5> & readonly [2, 3, 4, 5]
 *
 * type E = ConstrainedList.Last<Branded>; // 5
 * ```
 */
export namespace ConstrainedList {
  /**
   * Reverses `Ar`, keeping its length constraint — reversing changes no
   * length, so the bounds carry over untouched and no arithmetic is needed.
   *
   * @template Ar - The array type to reverse.
   */
  export type Reverse<Ar extends readonly unknown[]> =
    HasLengthConstraint<Ar> extends true
      ? ChangeArrayElement<Ar, Ar[number]> & ReverseStructure<Ar>
      : List.Reverse<Ar>;

  /**
   * Replaces the element at index `I` of `Ar` with `V`, keeping its length
   * constraint. Like {@link Reverse}, this changes no length.
   *
   * @template I - The index to update.
   * @template V - The new type at that index.
   * @template Ar - The array type to update.
   */
  export type SetAt<I extends number, V, Ar extends readonly unknown[]> =
    HasLengthConstraint<Ar> extends true
      ? ChangeArrayElement<Ar, Ar[number] | V> & SetAtStructure<Ar, I, V>
      : List.SetAt<I, V, Ar>;

  /**
   * Drops the first element of `Ar`, lowering both bounds by one.
   *
   * @template Ar - The array type to take the tail of.
   */
  export type Tail<Ar extends readonly unknown[]> =
    HasLengthConstraint<Ar> extends true
      ? ShrunkBy<Ar, 1> & TailStructure<Ar>
      : List.Tail<Ar>;

  /**
   * Drops the last element of `Ar`, lowering both bounds by one.
   *
   * @template Ar - The array type to take all but the last element of.
   */
  export type ButLast<Ar extends readonly unknown[]> =
    HasLengthConstraint<Ar> extends true
      ? ShrunkBy<Ar, 1> & ButLastStructure<Ar>
      : List.ButLast<Ar>;

  /**
   * Keeps the first `N` elements of `Ar`. Both bounds are capped at `N`: the
   * result holds `N` elements when `Ar` is at least that long and all of `Ar`
   * otherwise, so the maximum is `min(N, max)` and the minimum `min(N, min)`.
   *
   * @template N - The number of elements to keep.
   * @template Ar - The array type to take from.
   */
  export type Take<N extends SupportedLength, Ar extends readonly unknown[]> =
    HasLengthConstraint<Ar> extends true
      ? PinsOneNumber<N> extends true // see the note below
        ? CappedAt<Ar, N> & TakeStructure<N, Ar>
        : readonly Ar[number][]
      : List.Take<N, Ar>;

  /**
   * Keeps the last `N` elements of `Ar`. The bounds move exactly as in
   * {@link Take}.
   *
   * @template N - The number of elements to keep.
   * @template Ar - The array type to take from.
   */
  export type TakeLast<
    N extends SupportedLength,
    Ar extends readonly unknown[],
  > =
    HasLengthConstraint<Ar> extends true
      ? PinsOneNumber<N> extends true // see the note below
        ? CappedAt<Ar, N> & TakeLastStructure<N, Ar>
        : readonly Ar[number][]
      : List.TakeLast<N, Ar>;

  /**
   * Drops the first `N` elements of `Ar`, lowering both bounds by `N` (both
   * saturating at `0`).
   *
   * @template N - The number of elements to drop.
   * @template Ar - The array type to drop from.
   */
  export type Skip<N extends SupportedLength, Ar extends readonly unknown[]> =
    HasLengthConstraint<Ar> extends true
      ? PinsOneNumber<N> extends true // see the note below
        ? ShrunkBy<Ar, N> & SkipStructure<N, Ar>
        : readonly Ar[number][]
      : List.Skip<N, Ar>;

  /**
   * Drops the last `N` elements of `Ar`. The bounds move exactly as in
   * {@link Skip}.
   *
   * @template N - The number of elements to drop.
   * @template Ar - The array type to drop from.
   */
  export type SkipLast<
    N extends SupportedLength,
    Ar extends readonly unknown[],
  > =
    HasLengthConstraint<Ar> extends true
      ? PinsOneNumber<N> extends true // see the note below
        ? ShrunkBy<Ar, N> & SkipLastStructure<N, Ar>
        : readonly Ar[number][]
      : List.SkipLast<N, Ar>;

  /**
   * Concatenates `Ar1` and `Ar2`, adding their bounds. An unbounded maximum on
   * either side leaves the result unbounded above.
   *
   * @template Ar1 - The first array type.
   * @template Ar2 - The second array type.
   */
  export type Concat<
    Ar1 extends readonly unknown[],
    Ar2 extends readonly unknown[],
  > =
    EitherIsConstrained<Ar1, Ar2> extends true
      ? FromBounds<
          AddLength<EffectiveMinLengthOf<Ar1>, EffectiveMinLengthOf<Ar2>>,
          AddOrUnbounded<EffectiveMaxLengthOf<Ar1>, EffectiveMaxLengthOf<Ar2>>,
          Ar1[number] | Ar2[number]
        > &
          ConcatStructure<Ar1, Ar2>
      : List.Concat<Ar1, Ar2>;

  /**
   * Pairs up `Ar1` and `Ar2` elementwise. Zipping stops at the shorter input,
   * so both bounds are the smaller of the two.
   *
   * @template Ar1 - The first array type.
   * @template Ar2 - The second array type.
   */
  export type Zip<
    Ar1 extends readonly unknown[],
    Ar2 extends readonly unknown[],
  > =
    EitherIsConstrained<Ar1, Ar2> extends true
      ? FromBounds<
          SmallerLength<EffectiveMinLengthOf<Ar1>, EffectiveMinLengthOf<Ar2>>,
          SmallerOrDefined<
            EffectiveMaxLengthOf<Ar1>,
            EffectiveMaxLengthOf<Ar2>
          >,
          readonly [Ar1[number], Ar2[number]]
        > &
          ZipStructure<Ar1, Ar2>
      : List.Zip<Ar1, Ar2>;

  /**
   * The first element of `Ar`, or `D` when `Ar` may be empty.
   *
   * A brand with a non-zero minimum already guarantees the element exists, so
   * `D` only appears when the bounds allow an empty array.
   *
   * @template Ar - The array type to take the head of.
   * @template D - What to answer when `Ar` may be empty.
   */
  export type Head<Ar extends readonly unknown[], D = never> =
    HasLengthConstraint<Ar> extends true
      ? PinsExactTuple<Ar> extends true
        ? List.Head<MaterializeTuple<Ar>, D>
        : EffectiveMinLengthOf<Ar> extends 0
          ? Ar[number] | D
          : Ar[number]
      : List.Head<Ar, D>;

  /**
   * The last element of `Ar`. As with {@link Head}, a brand alone cannot say
   * *which* element that is, so it answers the element type; an exact tuple
   * pins the position.
   *
   * @template Ar - The array type to take the last element of.
   */
  export type Last<Ar extends readonly unknown[]> =
    HasLengthConstraint<Ar> extends true
      ? PinsExactTuple<Ar> extends true
        ? List.Last<MaterializeTuple<Ar>>
        : Ar[number]
      : List.Last<Ar>;

  /**
   * Splits `Ar` into chunks of `N` elements. The last chunk holds the
   * remainder, so every chunk is non-empty and at most `N` long — which is what
   * the brand can say without knowing the exact length.
   *
   * @template N - The chunk size.
   * @template Ar - The array type to split.
   */
  export type Partition<
    N extends SupportedLength,
    Ar extends readonly unknown[],
  > =
    HasLengthConstraint<Ar> extends true
      ? PinsOneNumber<N> extends true // see the note below
        ? [N] extends [0]
          ? never // no partition into chunks of nothing; see Tuple.Partition
          : readonly BoundedLengthArray<1, N, Ar[number]>[] &
              PartitionStructure<N, Ar>
        : readonly (readonly Ar[number][])[]
      : List.Partition<N, Ar>;

  /*
   * Why the counting members insist on a single literal `N`.
   *
   * Each of them uses `N` in two independent places — the bound arithmetic and
   * the structural rebuild — and both distribute over a union on their own. Let
   * them, and the result is the *cross product* of the two:
   *
   *   ConstrainedList.Take<1 | 2, MinLengthArray<3, number>>
   *   // FixedLengthArray<1, number>
   *   // | BoundedLengthArray<2, 1, number>   <- min above max, uninhabited
   *   // | BoundedLengthArray<1, 2, number>
   *   // | FixedLengthArray<2, number>
   *
   * Distributing once at the top would fix that, and would be exact. But `N` is
   * bounded here by `SupportedLength`, which is `0..2048` — so the union handed
   * to these is potentially enormous, and the per-member cost is the whole
   * bound-recovery-and-rebuild machinery rather than a tuple splice.
   *
   * They take the same way out as `Tuple` does: a union of literals, like
   * `number`, does not pin a length, so the answer is the unconstrained
   * `readonly Elm[]` that every possible result satisfies. Dropping the brand
   * loses a bound the caller might have wanted, but recovering it would mean
   * folding min and max across the union, which is the cost this avoids.
   */

  /*
   * `Flatten` has deliberately no counterpart here. Unlike the members above it
   * is only imprecise on a branded input, never wrong — `List.Flatten` already
   * answers `readonly Elm[]` rather than `unknown[]`, and it neither loses the
   * element type nor exceeds the instantiation limit. Recovering the positions
   * would additionally require materializing every *member*, since a branded
   * member cannot be spread either, which is more machinery than the gain
   * justifies.
   */
}

/**
 * Rebuilds a length-constrained array from explicit bounds, where `Max` may be
 * `never` to mean "no upper bound".
 *
 * The result is spelled with the most specific member of the family the bounds
 * allow — `FixedLengthArray` when they coincide, `MaxLengthArray` when there is
 * no lower bound, `MinLengthArray` when there is no upper one — so that a round
 * trip through this type is the identity rather than a strictly narrower or
 * wider relative of what went in.
 *
 * Bounds that constrain nothing produce a plain `readonly Elm[]`, as does a
 * bound the brand cannot express; the latter is the safe direction, since it
 * claims less rather than more.
 *
 * @template Min - The minimum length.
 * @template Max - The maximum length, or `never` for none.
 * @template Elm - The element type.
 */
export type FromBounds<Min, Max, Elm> =
  IsNever<Max> extends true
    ? Min extends 0
      ? readonly Elm[]
      : Min extends SupportedLength
        ? MinLengthArray<Min, Elm>
        : readonly Elm[]
    : Max extends SupportedLength
      ? Min extends SupportedLength
        ? Min extends Max
          ? FixedLengthArray<Min, Elm>
          : Min extends 0
            ? MaxLengthArray<Max, Elm>
            : BoundedLengthArray<Min, Max, Elm>
        : readonly Elm[]
      : readonly Elm[];

/**
 * Collapses a length-constrained array to its shortest equivalent spelling.
 *
 * The family expands structurally, so a brand intersected with a tuple carries
 * several conjuncts the tuple already subsumes. The normal form is exactly two:
 * the tuple, which says everything structural there is to say, and the brand,
 * which is the only part the tuple cannot express. It is the *same type* —
 * every conjunct dropped was implied by the tuple — just written the shortest
 * way.
 *
 * That is also what makes a `ConstrainedList` answer comparable with applying
 * the operation to each half separately: the two are the same type, but only
 * their normalized spellings are the same *shape*.
 *
 * @example
 * ```ts
 * type Naive = BoundedLengthArray<2, 5, number> & readonly [3, 2, 1];
 * // readonly number[] & MinLengthTuple<2, number> & <brand> & readonly [3, 2, 1]
 *
 * type Normal = NormalizeLengthConstraint<Naive>;
 * // readonly [3, 2, 1] & <brand>
 *
 * type Branded = BoundedLengthArray<2, 5, number> & readonly [1, 2, 3];
 *
 * // The same type, reached two ways — identical once both are normalized.
 * type Direct = NormalizeLengthConstraint<ConstrainedList.Reverse<Branded>>;
 *
 * type Separately = NormalizeLengthConstraint<
 *   ConstrainedList.Reverse<BoundedLengthArray<2, 5, number>> &
 *     List.Reverse<readonly [1, 2, 3]>
 * >;
 * ```
 *
 * An input pinning no exact length — a pure brand, or a tuple longer than the
 * rebuild cap — is already as short as it gets and comes back unchanged.
 *
 * The equivalence holds as long as the brand and the tuple agree, which is
 * automatic for a guard-produced type: the guard checked the length before
 * narrowing. For a contradictory intersection written by hand — a brand
 * demanding at least six elements over a five-tuple — the conjunct dropped is
 * the one the tuple does *not* imply, and the result is strictly wider.
 *
 * @template Ar - The array type to normalize.
 */
export type NormalizeLengthConstraint<Ar extends readonly unknown[]> =
  PinsExactTuple<Ar> extends true
    ? MaterializeTuple<Ar> & LengthConstraintBrandOf<Ar>
    : Ar;

/**
 * @internal The exact tuple `Ar` pins, rebuilt one index at a time.
 *
 * A brand intersected with a tuple is the normal shape a ts-data-forge guard
 * produces, and the tuple half is the more informative one — but it cannot be
 * recovered by matching: variadic `infer` does not see through an
 * intersection, so `Ar extends readonly [...infer T] ? T : never` answers
 * `unknown[]` for `MinLengthArray<3, E> & readonly [a, b, c, d, e]`, and the
 * same blindness is why `List.Tail` of such a type is `readonly unknown[]`.
 *
 * Indexed access *does* reach through the intersection (`Ar[0]` is `a`,
 * `Ar['length']` is `5`), so the tuple is rebuilt positionally instead. The
 * accumulator sits in tail position, so this is tail-recursive; it still costs
 * one instantiation per element, which is what {@link PinsExactTuple} caps.
 */
type MaterializeTuple<
  Ar extends readonly unknown[],
  Acc extends readonly unknown[] = readonly [],
> = Acc['length'] extends Ar['length']
  ? Acc
  : MaterializeTuple<Ar, readonly [...Acc, Ar[Acc['length'] & number]]>;

/**
 * @internal Whether `Ar` pins one exact length, short enough to be worth
 * rebuilding positionally.
 *
 * A pure brand never does — its `length` is `number` — so the structural
 * refinement is skipped and the brand answer stands alone.
 */
type PinsExactTuple<Ar extends readonly unknown[]> = BoolAnd<
  IsFixedLengthList<Ar>,
  TypeExtends<Ar['length'], UintRangeInclusive<0, StructuralOpCap>>
>;

/**
 * @internal Longest exact tuple {@link MaterializeTuple} will rebuild.
 *
 * Past this the positional answer stops being worth its cost, and the brand
 * alone is used — which claims less, never more, so the cap only ever loses
 * precision.
 */
type StructuralOpCap = 32;

/** @internal {@link List.Reverse} of the exact tuple, when there is one. */
type ReverseStructure<Ar extends readonly unknown[]> =
  PinsExactTuple<Ar> extends true
    ? List.Reverse<MaterializeTuple<Ar>>
    : unknown;

/** @internal {@link List.SetAt} of the exact tuple, when there is one. */
type SetAtStructure<Ar extends readonly unknown[], I extends number, V> =
  PinsExactTuple<Ar> extends true
    ? List.SetAt<I, V, MaterializeTuple<Ar>>
    : unknown;

/** @internal {@link List.Tail} of the exact tuple, when there is one. */
type TailStructure<Ar extends readonly unknown[]> =
  PinsExactTuple<Ar> extends true ? List.Tail<MaterializeTuple<Ar>> : unknown;

/** @internal {@link List.ButLast} of the exact tuple, when there is one. */
type ButLastStructure<Ar extends readonly unknown[]> =
  PinsExactTuple<Ar> extends true
    ? List.ButLast<MaterializeTuple<Ar>>
    : unknown;

/** @internal {@link List.Take} of the exact tuple, when there is one. */
type TakeStructure<N extends SupportedLength, Ar extends readonly unknown[]> =
  PinsExactTuple<Ar> extends true
    ? List.Take<N, MaterializeTuple<Ar>>
    : unknown;

/** @internal {@link List.TakeLast} of the exact tuple, when there is one. */
type TakeLastStructure<
  N extends SupportedLength,
  Ar extends readonly unknown[],
> =
  PinsExactTuple<Ar> extends true
    ? List.TakeLast<N, MaterializeTuple<Ar>>
    : unknown;

/** @internal {@link List.Skip} of the exact tuple, when there is one. */
type SkipStructure<N extends SupportedLength, Ar extends readonly unknown[]> =
  PinsExactTuple<Ar> extends true
    ? List.Skip<N, MaterializeTuple<Ar>>
    : unknown;

/** @internal {@link List.SkipLast} of the exact tuple, when there is one. */
type SkipLastStructure<
  N extends SupportedLength,
  Ar extends readonly unknown[],
> =
  PinsExactTuple<Ar> extends true
    ? List.SkipLast<N, MaterializeTuple<Ar>>
    : unknown;

/** @internal {@link List.Partition} of the exact tuple, when there is one. */
type PartitionStructure<
  N extends SupportedLength,
  Ar extends readonly unknown[],
> =
  PinsExactTuple<Ar> extends true
    ? List.Partition<N, MaterializeTuple<Ar>>
    : unknown;

/**
 * @internal {@link List.Concat} of the exact tuples, when *both* sides pin one
 * — a rest element on either side makes the concatenation's positions
 * unknowable.
 */
type ConcatStructure<
  Ar1 extends readonly unknown[],
  Ar2 extends readonly unknown[],
> =
  BothPinExactTuples<Ar1, Ar2> extends true
    ? List.Concat<MaterializeTuple<Ar1>, MaterializeTuple<Ar2>>
    : unknown;

/** @internal {@link List.Zip} of the exact tuples, when both sides pin one. */
type ZipStructure<
  Ar1 extends readonly unknown[],
  Ar2 extends readonly unknown[],
> =
  BothPinExactTuples<Ar1, Ar2> extends true
    ? List.Zip<MaterializeTuple<Ar1>, MaterializeTuple<Ar2>>
    : unknown;

/**
 * @internal Whether both inputs pin an exact tuple. An unbranded tuple pins one
 * on its own, so a branded/plain pair still refines.
 */
type BothPinExactTuples<
  Ar1 extends readonly unknown[],
  Ar2 extends readonly unknown[],
> = BoolAnd<PinsExactTuple<Ar1>, PinsExactTuple<Ar2>>;

/** @internal Whether either input carries a length-constraint brand. */
type EitherIsConstrained<
  Ar1 extends readonly unknown[],
  Ar2 extends readonly unknown[],
> = HasLengthConstraint<Ar1> extends true ? true : HasLengthConstraint<Ar2>;

/** @internal `Ar` with both bounds lowered by `N`, saturating at `0`. */
type ShrunkBy<
  Ar extends readonly unknown[],
  N extends SupportedLength,
> = FromBounds<
  SubLength<EffectiveMinLengthOf<Ar>, N>,
  SubOrUnbounded<EffectiveMaxLengthOf<Ar>, N>,
  Ar[number]
>;

/** @internal `Ar` with both bounds capped at `N`. */
type CappedAt<
  Ar extends readonly unknown[],
  N extends SupportedLength,
> = FromBounds<
  SmallerLength<EffectiveMinLengthOf<Ar>, N>,
  // An unbounded input becomes bounded: at most `N` elements come back.
  IsNever<EffectiveMaxLengthOf<Ar>> extends true
    ? N
    : SmallerLength<EffectiveMaxLengthOf<Ar>, N>,
  Ar[number]
>;

/** @internal {@link SubLength}, propagating "no upper bound" as `never`. */
type SubOrUnbounded<Max, N extends SupportedLength> =
  IsNever<Max> extends true ? never : SubLength<Max, N>;

/** @internal {@link AddLength}, where an unbounded side wins. */
type AddOrUnbounded<Max1, Max2> =
  IsNever<Max1> extends true
    ? never
    : IsNever<Max2> extends true
      ? never
      : AddLength<Max1, Max2>;

/** @internal {@link SmallerLength}, where a defined side wins over `never`. */
type SmallerOrDefined<Max1, Max2> =
  IsNever<Max1> extends true
    ? Max2
    : IsNever<Max2> extends true
      ? Max1
      : SmallerLength<Max1, Max2>;

/**
 * @internal `A + B`, as the length of the two length tuples spliced together.
 *
 * The arithmetic in this file goes through {@link LengthTuple} rather than
 * stepping a counter, so each operation costs a handful of instantiations
 * regardless of how large the bounds are: `MakeTuple` builds a tuple by
 * digit-wise tiling, and the operations below are single variadic-tuple
 * matches against it.
 */
type AddLength<A, B> = [...LengthTuple<A>, ...LengthTuple<B>]['length'];

/** @internal `A - B`, saturating at `0`. */
type SubLength<A, B> =
  LengthTuple<A> extends readonly [...LengthTuple<B>, ...infer Rest]
    ? Rest['length']
    : 0;

/** @internal `min(A, B)`. */
type SmallerLength<A, B> =
  LengthTuple<A> extends readonly [...LengthTuple<B>, ...unknown[]] ? B : A;

/**
 * @internal A tuple whose length is `N`. The `& number` keeps `MakeTuple`'s
 * constraint satisfied for a bound that is still deferred on a type parameter,
 * which is the normal case here.
 */
type LengthTuple<N> = MakeTuple<N & number, 0>;
