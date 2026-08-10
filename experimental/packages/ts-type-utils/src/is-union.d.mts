type IsUnion<U> = TSTypeUtilsInternals.IsUnionImpl<U, U>;

/** @internal */
declare namespace TSTypeUtilsInternals {
  type IsUnionImpl<U, K extends U> =
    IsNever<U> extends true
      ? false
      : K extends K
        ? BoolNot<TypeEq<U, K>>
        : never;
}
