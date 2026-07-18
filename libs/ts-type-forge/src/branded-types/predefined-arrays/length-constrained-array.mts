import { type Mutable } from '../../others/index.mjs';
import {
  type FixedLengthTuple,
  type MinLengthTuple,
  type MutableFixedLengthTuple,
  type MutableMinLengthTuple,
} from '../../tuple-and-list/index.mjs';
import { type UintRangeInclusive } from '../../type-level-integer/index.mjs';
import { type TSTypeForgeInternals_BrandEncapsulated } from '../_internals.mjs';
import { type SupportedLength } from '../supported-length.mjs';

/**
 * Upper bound (inclusive, `10`) of the structural tuple prefix embedded in
 * {@link MinLengthArray} (and, via composition, in {@link BoundedLengthArray}
 * and {@link FixedLengthArray}) — i.e. the boundary between "expand the
 * minimum length into tuple positions" and "fall back to `readonly Elm[]`".
 * The prefix is what makes indexed access below the minimum length not
 * include `undefined` under `noUncheckedIndexedAccess`. It is kept small so
 * that the prefix stays cheap for the type checker even when the element type
 * is large.
 *
 * Exported so that downstream libraries can share the same boundary instead
 * of hard-coding their own.
 */
export type StructuralPrefixCap = 10;

/**
 * Union of the length values (`0 | 1 | ... | 10`) at or below
 * {@link StructuralPrefixCap} — i.e. the lengths for which structural tuple
 * expansion is considered cheap enough. Exported so that downstream libraries
 * can use the same boundary as a type-parameter constraint (e.g. runtime
 * validators that only encode a structural tuple type for lengths in this
 * range and fall back to `readonly Elm[]` otherwise).
 */
export type StructuralPrefixLength = UintRangeInclusive<0, StructuralPrefixCap>;

/**
 * @internal Clamps `N` to {@link StructuralPrefixCap}. Monotone in `N`, so the
 * length-constraint subtyping relation is preserved across the cap (e.g.
 * `MinLengthArray<12, E>` stays assignable to `MinLengthArray<5, E>`).
 */
type ClampToPrefixCap<N extends number> =
  N extends UintRangeInclusive<0, StructuralPrefixCap>
    ? N
    : StructuralPrefixCap;

/**
 * Branded readonly array type for arrays with at most `MaxLength` elements.
 *
 * Unlike the structural tuple-based `MaxLengthTuple`, the length
 * constraint is encoded only in the brand, so the element type `Elm` never
 * gets multiplied into tuple positions or tuple unions. This keeps
 * type-checking cost (instantiation count / memory) independent of the size of
 * `Elm` and nearly independent of `MaxLength`, and also supports large bounds
 * (e.g. `1000`) that make the tuple-based family hit the recursion limit.
 * Prefer this type when `Elm` is a large type or the bound is large.
 *
 * The brand is encoded so that the natural subtyping relation between length
 * constraints is preserved: if `M <= N`, then `MaxLengthArray<M, Elm>` is
 * assignable to `MaxLengthArray<N, Elm>` (an array of at most `M` elements is
 * also an array of at most `N` elements). This is achieved by branding with
 * the union of allowed lengths (`0 | 1 | ... | MaxLength`), which shrinks as
 * the constraint gets stricter. The result is also covariant in `Elm`.
 *
 * @template MaxLength - The maximum number of elements (inclusive). Must be a
 *   non-negative integer literal.
 * @template Elm - The type of elements in the array (defaults to `unknown`).
 *
 * @example
 * ```ts
 * const isMaxLengthArray = <N extends SupportedLength, E>(
 *   xs: readonly E[],
 *   maxLength: N,
 * ): xs is MaxLengthArray<N, E> => xs.length <= maxLength;
 *
 * const tags = ['a', 'b', 'c'] as unknown as MaxLengthArray<8, string>;
 *
 * const relaxed: MaxLengthArray<16, string> = tags; // OK (8 <= 16)
 * const widened: readonly string[] = tags; // OK
 * // const strict: MaxLengthArray<2, string> = tags; // Error! (8 > 2)
 * ```
 */
export type MaxLengthArray<
  MaxLength extends SupportedLength,
  Elm = unknown,
> = readonly Elm[] &
  TSTypeForgeInternals_BrandEncapsulated<
    Readonly<{
      MaxLength: UintRangeInclusive<0, MaxLength>;
    }>
  >;

/**
 * Mutable counterpart of {@link MaxLengthArray}: a branded *mutable* array type
 * for arrays with at most `MaxLength` elements.
 *
 * Identical to {@link MaxLengthArray} except that the structural part is a
 * mutable `Elm[]` instead of `readonly Elm[]`, so elements can be reassigned.
 * The brand is the same, so a `MutableMaxLengthArray<M, Elm>` is assignable to
 * `MaxLengthArray<M, Elm>`.
 *
 * Note that the `MaxLength` constraint is not enforced under mutation: pushing
 * additional elements past the bound is not a type error (as with any mutable
 * array whose length is tracked only in the brand).
 *
 * @template MaxLength - The maximum number of elements (inclusive). Must be a
 *   non-negative integer literal.
 * @template Elm - The type of elements in the array (defaults to `unknown`).
 *
 * @example
 * ```ts
 * const tags = ['a', 'b', 'c'] as unknown as MutableMaxLengthArray<8, string>;
 *
 * tags[0] = 'z'; // OK — elements are mutable
 * const relaxed: MaxLengthArray<16, string> = tags; // OK (8 <= 16)
 * // const strict: MutableMaxLengthArray<2, string> = tags; // Error! (8 > 2)
 * ```
 */
export type MutableMaxLengthArray<
  MaxLength extends SupportedLength,
  Elm = unknown,
> = Mutable<readonly Elm[]> &
  TSTypeForgeInternals_BrandEncapsulated<
    Readonly<{
      MaxLength: UintRangeInclusive<0, MaxLength>;
    }>
  >;

/**
 * Branded readonly array type for arrays with at least `MinLength` elements.
 *
 * Unlike the structural tuple-based {@link MinLengthTuple}, the exact length
 * constraint is encoded in the brand (a tuple of the literal `0`, whose cost
 * does not depend on `Elm`), so type-checking cost stays essentially
 * independent of the size of `Elm` and of the bound. Prefer this type when
 * `Elm` is a large type or the bound is large.
 *
 * For ergonomics, the structural part is not a plain `readonly Elm[]` but
 * `MinLengthTuple<min(MinLength, 10), Elm>`: indexed access below
 * `min(MinLength, 10)` does not include `undefined` under
 * `noUncheckedIndexedAccess`. The prefix length is clamped at `10` so that the
 * structural part stays cheap for large bounds; the clamp is monotone, so the
 * subtyping relation below is unaffected.
 *
 * The brand is encoded so that the natural subtyping relation between length
 * constraints is preserved: if `M >= N`, then `MinLengthArray<M, Elm>` is
 * assignable to `MinLengthArray<N, Elm>` (an array of at least `M` elements is
 * also an array of at least `N` elements). This is achieved by branding with a
 * readonly tuple type that requires at least `MinLength` elements, which
 * becomes a narrower type as the constraint gets stricter. The result is also
 * covariant in `Elm`.
 *
 * @template MinLength - The minimum number of elements (inclusive). Must be a
 *   non-negative integer literal.
 * @template Elm - The type of elements in the array (defaults to `unknown`).
 *
 * @example
 * ```ts
 * const isMinLengthArray = <N extends SupportedLength, E>(
 *   xs: readonly E[],
 *   minLength: N,
 * ): xs is MinLengthArray<N, E> => xs.length >= minLength;
 *
 * const history = [0, 1, 2, 3] as unknown as MinLengthArray<3, number>;
 *
 * const nonEmpty: MinLengthArray<1, number> = history; // OK (3 >= 1)
 * const first: number = history[0]; // OK — no `undefined` below min(N, 10)
 * // const longer: MinLengthArray<5, number> = history; // Error! (3 < 5)
 * ```
 */
export type MinLengthArray<
  MinLength extends SupportedLength,
  Elm = unknown,
> = MinLengthTuple<ClampToPrefixCap<MinLength>, Elm> &
  TSTypeForgeInternals_BrandEncapsulated<
    Readonly<{
      MinLength: MinLengthTuple<MinLength, 0>;
    }>
  >;

/**
 * Mutable counterpart of {@link MinLengthArray}: a branded *mutable* array type
 * for arrays with at least `MinLength` elements.
 *
 * Identical to {@link MinLengthArray} except that the clamped structural prefix
 * is mutable ({@link MutableMinLengthTuple} instead of {@link MinLengthTuple}),
 * so elements can be reassigned. The brand is the same, so a
 * `MutableMinLengthArray<M, Elm>` is assignable to `MinLengthArray<M, Elm>`.
 *
 * This is the mutable, brand-based counterpart of the structural tuple-based
 * `MutableMinLengthTuple`; type-checking cost stays essentially independent of
 * the size of `Elm` and of the bound.
 *
 * @template MinLength - The minimum number of elements (inclusive). Must be a
 *   non-negative integer literal.
 * @template Elm - The type of elements in the array (defaults to `unknown`).
 *
 * @example
 * ```ts
 * const history = [0, 1, 2, 3] as unknown as MutableMinLengthArray<3, number>;
 *
 * history[0] = 10; // OK — elements are mutable
 * const first: number = history[0]; // OK — no `undefined` below min(N, 10)
 * const readonlyView: MinLengthArray<3, number> = history; // OK
 * // const longer: MutableMinLengthArray<5, number> = history; // Error! (3 < 5)
 * ```
 */
export type MutableMinLengthArray<
  MinLength extends SupportedLength,
  Elm = unknown,
> = MutableMinLengthTuple<ClampToPrefixCap<MinLength>, Elm> &
  TSTypeForgeInternals_BrandEncapsulated<
    Readonly<{
      MinLength: MinLengthTuple<MinLength, 0>;
    }>
  >;

/**
 * Branded readonly array type for arrays whose length is between `MinLength`
 * and `MaxLength` elements (both inclusive).
 * Defined as the intersection of {@link MinLengthArray} and
 * {@link MaxLengthArray}, so both bounds can be weakened independently:
 * `BoundedLengthArray<M1, M2, Elm>` is assignable to
 * `BoundedLengthArray<N1, N2, Elm>` if `M1 >= N1` and `M2 <= N2`.
 *
 * This is the brand-based, lightweight counterpart of the structural
 * tuple-based `BoundedLengthTuple`; see {@link MaxLengthArray} for why it
 * is much cheaper to type-check when the element type is large.
 *
 * @template MinLength - The minimum number of elements (inclusive). Must be a
 *   non-negative integer literal.
 * @template MaxLength - The maximum number of elements (inclusive). Must be a
 *   non-negative integer literal.
 * @template Elm - The type of elements in the array (defaults to `unknown`).
 *
 * @example
 * ```ts
 * const selection = [1, 2, 3] as unknown as BoundedLengthArray<1, 5, number>;
 *
 * const relaxed: BoundedLengthArray<0, 100, number> = selection; // OK ([1, 5] ⊆ [0, 100])
 * const atLeast1: MinLengthArray<1, number> = selection; // OK
 * const atMost5: MaxLengthArray<5, number> = selection; // OK
 * // const strict: BoundedLengthArray<2, 5, number> = selection; // Error! (1 < 2)
 * ```
 */
export type BoundedLengthArray<
  MinLength extends SupportedLength,
  MaxLength extends SupportedLength,
  Elm = unknown,
> = MaxLengthArray<MaxLength, Elm> & MinLengthArray<MinLength, Elm>;

/**
 * Mutable counterpart of {@link BoundedLengthArray}: a branded *mutable* array
 * type for arrays whose length is between `MinLength` and `MaxLength` elements
 * (both inclusive). Defined as the intersection of
 * {@link MutableMinLengthArray} and {@link MutableMaxLengthArray}, so the
 * clamped structural prefix stays mutable and both bounds can be weakened
 * independently. The brand is the same as {@link BoundedLengthArray}, so a
 * `MutableBoundedLengthArray<M1, M2, Elm>` is assignable to
 * `BoundedLengthArray<M1, M2, Elm>`.
 *
 * @template MinLength - The minimum number of elements (inclusive). Must be a
 *   non-negative integer literal.
 * @template MaxLength - The maximum number of elements (inclusive). Must be a
 *   non-negative integer literal.
 * @template Elm - The type of elements in the array (defaults to `unknown`).
 *
 * @example
 * ```ts
 * const selection = [1, 2, 3] as unknown as MutableBoundedLengthArray<
 *   1,
 *   5,
 *   number
 * >;
 *
 * selection[0] = 10; // OK — elements are mutable
 * const relaxed: BoundedLengthArray<0, 100, number> = selection; // OK ([1, 5] ⊆ [0, 100])
 * // const strict: MutableBoundedLengthArray<2, 5, number> = selection; // Error! (1 < 2)
 * ```
 */
export type MutableBoundedLengthArray<
  MinLength extends SupportedLength,
  MaxLength extends SupportedLength,
  Elm = unknown,
> = MutableMaxLengthArray<MaxLength, Elm> &
  MutableMinLengthArray<MinLength, Elm>;

/**
 * Branded readonly array type for arrays with exactly `Length` elements.
 * Alias for `BoundedLengthArray<Length, Length, Elm>`.
 *
 * This is the brand-based, lightweight counterpart of the structural
 * tuple-based `FixedLengthTuple`; type-checking cost stays essentially
 * independent of the size of `Elm`. Prefer this type when `Elm` is a large
 * type or the length is large.
 *
 * For `Length <= 10`, the structural part is additionally intersected with the
 * exact tuple `FixedLengthTuple<Length, Elm>`, so `length` is the literal
 * `Length` and in-range indexed access does not include `undefined` under
 * `noUncheckedIndexedAccess` (and the type is assignable to
 * `FixedLengthTuple<Length, Elm>`). For larger lengths only the clamped
 * structural prefix inherited from {@link MinLengthArray} remains.
 *
 * @template Length - The exact number of elements. Must be a non-negative
 *   integer literal.
 * @template Elm - The type of elements in the array (defaults to `unknown`).
 *
 * @example
 * ```ts
 * const rgb = [255, 128, 0] as unknown as FixedLengthArray<3, number>;
 *
 * const atMost5: MaxLengthArray<5, number> = rgb; // OK (3 <= 5)
 * const nonEmpty: MinLengthArray<1, number> = rgb; // OK (3 >= 1)
 * const red: number = rgb[0]; // OK — in-range indexed access (N <= 10)
 * const len: 3 = rgb.length; // `length` is the literal N (N <= 10)
 * // const rgba: FixedLengthArray<4, number> = rgb; // Error!
 * ```
 */
export type FixedLengthArray<
  Length extends SupportedLength,
  Elm = unknown,
> = BoundedLengthArray<Length, Length, Elm> &
  (Length extends UintRangeInclusive<0, StructuralPrefixCap>
    ? FixedLengthTuple<Length, Elm>
    : unknown);

/**
 * Mutable counterpart of {@link FixedLengthArray}: a branded *mutable* array
 * type for arrays with exactly `Length` elements.
 * Alias for `MutableBoundedLengthArray<Length, Length, Elm>`.
 *
 * Identical to {@link FixedLengthArray} except that the structural part is
 * mutable: for `Length <= 10` it is intersected with the exact mutable tuple
 * {@link MutableFixedLengthTuple} (so `length` is the literal `Length`,
 * in-range indexed access does not include `undefined` under
 * `noUncheckedIndexedAccess`, and elements can be reassigned); for larger
 * lengths only the clamped mutable structural prefix inherited from
 * {@link MutableMinLengthArray} remains. The brand is the same as
 * {@link FixedLengthArray}, so a `MutableFixedLengthArray<Length, Elm>` is
 * assignable to `FixedLengthArray<Length, Elm>`.
 *
 * @template Length - The exact number of elements. Must be a non-negative
 *   integer literal.
 * @template Elm - The type of elements in the array (defaults to `unknown`).
 *
 * @example
 * ```ts
 * const rgb = [255, 128, 0] as unknown as MutableFixedLengthArray<3, number>;
 *
 * rgb[0] = 200; // OK — elements are mutable
 * const len: 3 = rgb.length; // `length` is the literal N (N <= 10)
 * const readonlyView: FixedLengthArray<3, number> = rgb; // OK
 * // const rgba: MutableFixedLengthArray<4, number> = rgb; // Error!
 * ```
 */
export type MutableFixedLengthArray<
  Length extends SupportedLength,
  Elm = unknown,
> = MutableBoundedLengthArray<Length, Length, Elm> &
  (Length extends UintRangeInclusive<0, StructuralPrefixCap>
    ? MutableFixedLengthTuple<Length, Elm>
    : unknown);
