import {
  type BoolAnd,
  type BoolOr,
  type FiniteNumber,
  type Int,
  type NegativeFiniteNumber,
  type NegativeInt,
  type NegativeNumber,
  type NegativeSafeInt,
  type NonNegativeFiniteNumber,
  type NonNegativeInt,
  type NonNegativeNumber,
  type NonPositiveFiniteNumber,
  type NonPositiveInt,
  type NonPositiveNumber,
  type NonPositiveSafeInt,
  type NonZeroFiniteNumber,
  type NonZeroInt,
  type NonZeroNumber,
  type NonZeroSafeInt,
  type PositiveFiniteNumber,
  type PositiveInt,
  type PositiveNumber,
  type PositiveSafeInt,
  type SafeInt,
  type SafeUint,
  type Uint,
} from 'ts-type-forge';
import { expectType } from '../expect-type.mjs';

/**
 * Internal type-level arithmetic for {@link Num}'s `add`/`sub`/`mul`/`div`.
 *
 * The result type of a binary operation is computed from two independent axes of
 * each operand:
 *
 * - **Sign** — `pos | neg | nonneg | nonpos | nonzero | any`, derived from the
 *   brand's sign keys and combined with a small boolean algebra over the facts
 *   `>= 0`, `<= 0`, `!= 0`.
 * - **Level** — `safeint | int | finite | number`, derived from the brand's
 *   level keys.
 *
 * The sign is always computed exactly (so e.g. `neg * neg` becomes `pos`). The
 * level widens on possible overflow (`safeint` results of `+`/`-`/`*` become
 * `int`, since the magnitude may exceed the safe-integer range). No runtime
 * clamping is performed — saturating "stay in the type" behavior is provided by
 * the branded namespaces instead.
 *
 * @internal
 */

/** Sign classification of a numeric brand. */
type Sign = 'any' | 'neg' | 'nonneg' | 'nonpos' | 'nonzero' | 'pos';

/** Level (integer/finite) classification of a numeric brand. */
type Level = 'finite' | 'int' | 'number' | 'safeint';

/** Classifies a numeric type's sign. */
export type SignOf<N> = [N] extends [PositiveNumber]
  ? 'pos'
  : [N] extends [NegativeNumber]
    ? 'neg'
    : [N] extends [NonNegativeNumber]
      ? 'nonneg'
      : [N] extends [NonPositiveNumber]
        ? 'nonpos'
        : [N] extends [NonZeroNumber]
          ? 'nonzero'
          : 'any';

/** Classifies a numeric type's level. */
export type LevelOf<N> = [N] extends [SafeInt]
  ? 'safeint'
  : [N] extends [Int]
    ? 'int'
    : [N] extends [FiniteNumber]
      ? 'finite'
      : 'number';

// --- boolean fact algebra over a sign ----------------------------------------

/** Whether the value is guaranteed `>= 0`. */
type Ge0<S extends Sign> = S extends 'pos' | 'nonneg' ? true : false;

/** Whether the value is guaranteed `<= 0`. */
type Le0<S extends Sign> = S extends 'neg' | 'nonpos' ? true : false;

/** Whether the value is guaranteed `!= 0`. */
type Ne0<S extends Sign> = S extends 'pos' | 'neg' | 'nonzero' ? true : false;

/** Rebuilds a {@link Sign} from the three facts. */
type SignFromFacts<
  ge0 extends boolean,
  le0 extends boolean,
  ne0 extends boolean,
> = ge0 extends true
  ? ne0 extends true
    ? 'pos'
    : 'nonneg'
  : le0 extends true
    ? ne0 extends true
      ? 'neg'
      : 'nonpos'
    : ne0 extends true
      ? 'nonzero'
      : 'any';

type NegateSign<S extends Sign> = SignFromFacts<Le0<S>, Ge0<S>, Ne0<S>>;

// --- sign combination per operation ------------------------------------------

type AddSign<A extends Sign, B extends Sign> = SignFromFacts<
  BoolAnd<Ge0<A>, Ge0<B>>,
  BoolAnd<Le0<A>, Le0<B>>,
  BoolOr<
    BoolAnd<BoolAnd<Ge0<A>, Ge0<B>>, BoolOr<Ne0<A>, Ne0<B>>>,
    BoolAnd<BoolAnd<Le0<A>, Le0<B>>, BoolOr<Ne0<A>, Ne0<B>>>
  >
>;

type SubSign<A extends Sign, B extends Sign> = AddSign<A, NegateSign<B>>;

/** Sign of a product/quotient, parameterized by the `!= 0` fact of the result. */
type MulSignWithNe0<
  A extends Sign,
  B extends Sign,
  ne0 extends boolean,
> = SignFromFacts<
  BoolOr<BoolAnd<Ge0<A>, Ge0<B>>, BoolAnd<Le0<A>, Le0<B>>>,
  BoolOr<BoolAnd<Ge0<A>, Le0<B>>, BoolAnd<Le0<A>, Ge0<B>>>,
  ne0
>;

type MulSign<A extends Sign, B extends Sign> = MulSignWithNe0<
  A,
  B,
  BoolAnd<Ne0<A>, Ne0<B>>
>;

/** Exact division: nonzero dividend over nonzero divisor stays nonzero. */
type DivSign<A extends Sign, B extends Sign> = MulSignWithNe0<A, B, Ne0<A>>;

/** Floor division: flooring can land on `0`, so the result is never `!= 0`. */
type DivIntSign<A extends Sign, B extends Sign> = MulSignWithNe0<A, B, false>;

// --- level combination per operation -----------------------------------------

/** Looser of two levels (number > finite > int > safeint). */
type LooserLevel<LA extends Level, LB extends Level> = 'number' extends LA | LB
  ? 'number'
  : 'finite' extends LA | LB
    ? 'finite'
    : 'int' extends LA | LB
      ? 'int'
      : 'safeint';

type WidenSafeIntToInt<T> = T extends 'safeint' ? 'int' : T;

/** `+`/`-`/`*`: looser level, widening `safeint -> int` (overflow may occur). */
type AddMulLevel<LA extends Level, LB extends Level> = WidenSafeIntToInt<
  LooserLevel<LA, LB>
>;

/** Exact division yields a (possibly fractional) finite number. */
type DivLevel<LA extends Level, LB extends Level> = 'number' extends LA | LB
  ? 'number'
  : 'finite';

/** Floor division yields an integer; the safe range is preserved. */
type DivIntLevel<LA extends Level, LB extends Level> = 'number' extends LA | LB
  ? 'number'
  : [LA] extends ['safeint']
    ? [LB] extends ['safeint']
      ? 'safeint'
      : 'int'
    : 'int';

// --- reconstruction (sign, level) -> canonical brand -------------------------

type ReconstructNumber<S extends Sign> = S extends 'pos'
  ? PositiveNumber
  : S extends 'neg'
    ? NegativeNumber
    : S extends 'nonneg'
      ? NonNegativeNumber
      : S extends 'nonpos'
        ? NonPositiveNumber
        : S extends 'nonzero'
          ? NonZeroNumber
          : number;

type ReconstructFinite<S extends Sign> = S extends 'pos'
  ? PositiveFiniteNumber
  : S extends 'neg'
    ? NegativeFiniteNumber
    : S extends 'nonneg'
      ? NonNegativeFiniteNumber
      : S extends 'nonpos'
        ? NonPositiveFiniteNumber
        : S extends 'nonzero'
          ? NonZeroFiniteNumber
          : FiniteNumber;

type ReconstructInt<S extends Sign> = S extends 'pos'
  ? PositiveInt
  : S extends 'neg'
    ? NegativeInt
    : S extends 'nonneg'
      ? Uint
      : S extends 'nonpos'
        ? NonPositiveInt
        : S extends 'nonzero'
          ? NonZeroInt
          : Int;

type ReconstructSafeInt<S extends Sign> = S extends 'pos'
  ? PositiveSafeInt
  : S extends 'neg'
    ? NegativeSafeInt
    : S extends 'nonneg'
      ? SafeUint
      : S extends 'nonpos'
        ? NonPositiveSafeInt
        : S extends 'nonzero'
          ? NonZeroSafeInt
          : SafeInt;

type Reconstruct<S extends Sign, L extends Level> = L extends 'safeint'
  ? ReconstructSafeInt<S>
  : L extends 'int'
    ? ReconstructInt<S>
    : L extends 'finite'
      ? ReconstructFinite<S>
      : ReconstructNumber<S>;

// --- public result types -----------------------------------------------------

/** Result type of {@link Num.add} applied to operands of type `A` and `B`. */
export type AddResult<A, B> = Reconstruct<
  AddSign<SignOf<A>, SignOf<B>>,
  AddMulLevel<LevelOf<A>, LevelOf<B>>
>;

/** Result type of {@link Num.sub} applied to operands of type `A` and `B`. */
export type SubResult<A, B> = Reconstruct<
  SubSign<SignOf<A>, SignOf<B>>,
  AddMulLevel<LevelOf<A>, LevelOf<B>>
>;

/** Result type of {@link Num.mul} applied to operands of type `A` and `B`. */
export type MulResult<A, B> = Reconstruct<
  MulSign<SignOf<A>, SignOf<B>>,
  AddMulLevel<LevelOf<A>, LevelOf<B>>
>;

/** Result type of {@link Num.div} (exact) applied to operands of type `A` and `B`. */
export type DivResult<A, B> = Reconstruct<
  DivSign<SignOf<A>, SignOf<B>>,
  DivLevel<LevelOf<A>, LevelOf<B>>
>;

/** Result type of {@link Num.divInt} (floor) applied to operands of type `A` and `B`. */
export type DivIntResult<A, B> = Reconstruct<
  DivIntSign<SignOf<A>, SignOf<B>>,
  DivIntLevel<LevelOf<A>, LevelOf<B>>
>;

// #region type tests
{
  type A = NonPositiveInt;

  type B = NonPositiveInt;

  expectType<MulResult<A, B>, Uint>('=');

  type SignA = SignOf<A>;

  type SignB = SignOf<B>;

  expectType<SignA, 'nonpos'>('=');

  expectType<MulSign<SignA, SignB>, 'nonneg'>('=');

  expectType<BoolAnd<Ne0<SignA>, Ne0<SignB>>, false>('=');

  expectType<MulSignWithNe0<SignA, SignB, false>, 'nonneg'>('=');

  expectType<
    BoolOr<BoolAnd<Ge0<SignA>, Ge0<SignB>>, BoolAnd<Le0<SignA>, Le0<SignB>>>,
    true
  >('=');

  expectType<Ge0<SignA>, false>('=');

  expectType<Ge0<SignB>, false>('=');

  expectType<Le0<SignA>, true>('=');

  expectType<Le0<SignB>, true>('=');

  expectType<BoolAnd<Ge0<SignA>, Ge0<SignB>>, false>('=');

  expectType<BoolAnd<true, true>, true>('=');

  expectType<
    BoolOr<BoolAnd<Ge0<SignA>, Le0<SignB>>, BoolAnd<Le0<SignA>, Ge0<SignB>>>,
    false
  >('=');

  expectType<SignFromFacts<true, false, false>, 'nonneg'>('=');

  expectType<AddMulLevel<LevelOf<A>, LevelOf<B>>, 'int'>('=');

  type LA = LevelOf<A>;

  type LB = LevelOf<B>;

  expectType<LA, 'int'>('=');

  expectType<LooserLevel<LA, LB>, 'int'>('=');

  {
    type MulResult2<X, Y> = Reconstruct<
      MulSign<SignOf<X>, SignOf<Y>>,
      AddMulLevel<LevelOf<X>, LevelOf<Y>>
    >;

    expectType<MulResult<A, B>, MulResult2<A, B>>('=');

    expectType<
      MulResult<A, B>,
      Reconstruct<
        MulSign<SignOf<A>, SignOf<B>>,
        AddMulLevel<LevelOf<A>, LevelOf<B>>
      >
    >('=');

    expectType<
      Reconstruct<
        MulSign<SignOf<A>, SignOf<B>>,
        AddMulLevel<LevelOf<A>, LevelOf<B>>
      >,
      NonNegativeInt
    >('=');

    expectType<
      Reconstruct<MulSign<SignA, SignB>, AddMulLevel<LA, LB>>,
      NonNegativeInt
    >('=');

    expectType<Reconstruct<'nonneg', 'int'>, NonNegativeInt>('=');

    expectType<MulResult<A, B>, NonNegativeInt>('=');

    // type Reconstruct<S extends Sign, L extends Level> = L extends 'safeint'
    //   ? ReconstructSafeInt<S>
    //   : L extends 'int'
    //     ? ReconstructInt<S>
    //     : L extends 'finite'
    //       ? ReconstructFinite<S>
    //       : ReconstructNumber<S>;
  }

  // FromFacts<
  //   BoolOr<BoolAnd<Ge0<A>, Ge0<B>>, BoolAnd<Le0<A>, Le0<B>>>,
  //   BoolOr<BoolAnd<Ge0<A>, Le0<B>>, BoolAnd<Le0<A>, Ge0<B>>>,
  //   ne0
  // >;
}
// #endregion
