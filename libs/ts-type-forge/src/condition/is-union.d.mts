/**
 * Checks if a given type `U` is a union type (contains more than one distinct type member).
 *
 * It works by distributing over the potential union members of `U` and comparing
 * the original type `U` with each distributed member `M`. If `U` is a union,
 * there will be at least one `M` for which `TypeEq<U, M>` is `false`, causing the
 * result for that branch to be `true`. The final result becomes `true` if any branch
 * evaluates to `true`. If `U` is not a union, `M` will be the same as `U`,
 * `TypeEq<U, M>` will be `true`, and the result will be `false`.
 *
 * Note: `never`, `any`, and `unknown` are not considered unions by this type.
 *
 * @template U - The type to check.
 * @returns `true` if `U` is a union type, `false` otherwise.
 *
 * @example
 * type T1 = IsUnion<string | number>; // true
 * type T2 = IsUnion<string>; // false
 * type T3 = IsUnion<string | string>; // false (simplifies to string)
 * type T4 = IsUnion<never>; // false
 * type T5 = IsUnion<any>; // false
 * type T6 = IsUnion<unknown>; // false
 * type T7 = IsUnion<true | false>; // true (boolean)
 * type T8 = IsUnion<boolean>; // true (equivalent to true | false)
 */
type IsUnion<U> = TSTypeForgeInternals.IsUnionImpl<U, U>;

/** @internal */
declare namespace TSTypeForgeInternals {
  /**
   * Internal implementation detail for `IsUnion`.
   * Do not use directly.
   * @template U - The original type being checked.
   * @template M - The distributed member of `U`.
   * @internal
   */
  type IsUnionImpl<U, M extends U> =
    // Exclude `never` explicitly, as it behaves strangely in distributive types.
    IsNever<U> extends true
      ? false
      : // Distribute M over the members of U.
        M extends M
        ? BoolNot<TypeEq<U, M>>
        : never;
}
