type IsUnion<U> = _IsUnionImpl<U, U>;

/** @internal */
type _IsUnionImpl<U, K extends U> =
  IsNever<U> extends true ? false : K extends K ? BoolNot<TypeEq<U, K>> : never;
