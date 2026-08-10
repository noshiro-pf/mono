import { type TypeExtends } from '../condition/index.mjs';
import { type Int11, type Uint11 } from '../constants/index.mjs';
import { type BoolAnd, type RelaxedExclude } from '../others/index.mjs';
import { type Abs } from './abs.mjs';
import {
  type Index,
  type IndexInclusive,
  type NegativeIndex,
} from './index-type.mjs';
import { type UintRange, type UintRangeInclusive } from './uint-range.mjs';

/**
 * Creates a union of integer literals starting from `Start` (inclusive) up to
 * `End` (exclusive). Unlike {@link UintRange}, the bounds may be negative.
 *
 * The bounds are limited to the signed 11-bit range: `Start` must be an `Int11`
 * (`-1024` to `1023`) and `End` must be an `Int11` or `1024`, so that a bound
 * the union cannot represent fails with a readable constraint error instead of
 * resolving to `never`. Ranges where `Start >= End` (including a positive
 * `Start` with a negative `End`) resolve to `never`.
 *
 * @template Start - The starting integer literal (inclusive).
 * @template End - The ending integer literal (exclusive).
 * @returns A union type `Start | Start + 1 | ... | End - 1`.
 * @example
 * ```ts
 * type R1 = IntRange<1, 5>; // 1 | 2 | 3 | 4
 * type R2 = IntRange<-3, 3>; // -3 | -2 | -1 | 0 | 1 | 2
 * type R3 = IntRange<-5, -1>; // -5 | -4 | -3 | -2
 * type R4 = IntRange<3, -3>; // never
 * type R5 = IntRange<5, 5>; // never
 * ```
 */
export type IntRange<Start extends Int11, End extends Int11 | 1024> =
  BoolAnd<
    TypeExtends<Start, PositiveRange>,
    TypeExtends<End, PositiveRange>
  > extends true
    ? // `& Uint11` is a no-op for every value this branch admits (both bounds
      // are in `0..1024`); it only tells the checker what the branch already
      // guarantees, since a conditional type does not narrow a type parameter.
      UintRange<Start & Uint11, End & Uint11>
    : BoolAnd<
          TypeExtends<Start, NegativeRange>,
          TypeExtends<End, PositiveRange>
        > extends true
      ? NegativeIndex<Abs<Start>> | Index<End>
      : BoolAnd<
            TypeExtends<Start, PositiveRange>,
            TypeExtends<End, NegativeRange>
          > extends true
        ? never
        : BoolAnd<
              TypeExtends<Start, NegativeRange>,
              TypeExtends<End, NegativeRange>
            > extends true
          ? RelaxedExclude<NegativeIndex<Abs<Start>>, NegativeIndex<Abs<End>>>
          : never;

/**
 * Creates a union of integer literals starting from `MinValue` (inclusive) up
 * to `MaxValue` (inclusive). Unlike {@link UintRangeInclusive}, the bounds may
 * be negative.
 *
 * Both bounds are limited to the signed 11-bit range (`Int11`, `-1024` to
 * `1023`); an inclusive upper bound never needs the extra `1024` that
 * {@link IntRange}'s exclusive `End` accepts. Ranges where
 * `MinValue > MaxValue` (including a positive `MinValue` with a negative
 * `MaxValue`) resolve to `never`.
 *
 * @template MinValue - The starting integer literal (inclusive).
 * @template MaxValue - The ending integer literal (inclusive).
 * @returns A union type `MinValue | MinValue + 1 | ... | MaxValue`.
 * @example
 * ```ts
 * type RI1 = IntRangeInclusive<1, 5>; // 1 | 2 | 3 | 4 | 5
 * type RI2 = IntRangeInclusive<-3, 3>; // -3 | -2 | -1 | 0 | 1 | 2 | 3
 * type RI3 = IntRangeInclusive<-5, -1>; // -5 | -4 | -3 | -2 | -1
 * type RI4 = IntRangeInclusive<3, -3>; // never
 * type RI5 = IntRangeInclusive<5, 5>; // 5
 * ```
 */
export type IntRangeInclusive<MinValue extends Int11, MaxValue extends Int11> =
  BoolAnd<
    TypeExtends<MinValue, PositiveRange>,
    TypeExtends<MaxValue, PositiveRange>
  > extends true
    ? // See the `& Uint11` note on `IntRange` above.
      UintRangeInclusive<MinValue & Uint11, MaxValue & Uint11>
    : BoolAnd<
          TypeExtends<MinValue, NegativeRange>,
          TypeExtends<MaxValue, PositiveRange>
        > extends true
      ? NegativeIndex<Abs<MinValue>> | IndexInclusive<MaxValue>
      : BoolAnd<
            TypeExtends<MinValue, PositiveRange>,
            TypeExtends<MaxValue, NegativeRange>
          > extends true
        ? never
        : BoolAnd<
              TypeExtends<MinValue, NegativeRange>,
              TypeExtends<MaxValue, NegativeRange>
            > extends true
          ? RelaxedExclude<
              NegativeIndex<Abs<MinValue>>,
              NegativesCloserToZeroThan<MaxValue>
            >
          : never;

/**
 * @internal The negative literals strictly between `N` and zero
 * (`-1 | ... | N + 1`) — that is, `NegativeIndex<Abs<N>>` without `N` itself.
 * Excluding these instead of `NegativeIndex<Abs<N>>` is what makes the upper
 * bound of {@link IntRangeInclusive} inclusive.
 */
type NegativesCloserToZeroThan<N extends number> = RelaxedExclude<
  NegativeIndex<Abs<N>>,
  N
>;

/**
 * @internal The negative half of the bounds accepted by {@link IntRange} and
 * {@link IntRangeInclusive}.
 */
type NegativeRange = NegativeIndex<1024>;

/**
 * @internal The non-negative half of the bounds accepted by {@link IntRange}
 * and {@link IntRangeInclusive}.
 */
type PositiveRange = IndexInclusive<1024>;
