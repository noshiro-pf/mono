type BoolNot<A extends boolean> =
  //
  TypeEq<A, true> extends true
    ? false
    : TypeEq<A, false> extends true
      ? true
      : never;

type BoolAnd<A extends boolean, B extends boolean> =
  //
  TypeEq<A, true> extends true
    ? TypeEq<B, true> extends true
      ? true
      : TypeEq<B, false> extends true
        ? false
        : never
    : TypeEq<A, false> extends true
      ? TypeEq<B, true> extends true
        ? false
        : TypeEq<B, false> extends true
          ? false
          : never
      : never;

type BoolOr<A extends boolean, B extends boolean> =
  //
  TypeEq<A, true> extends true
    ? TypeEq<B, true> extends true
      ? true
      : TypeEq<B, false> extends true
        ? true
        : never
    : TypeEq<A, false> extends true
      ? TypeEq<B, true> extends true
        ? true
        : TypeEq<B, false> extends true
          ? false
          : never
      : never;

type BoolEq<A extends boolean, B extends boolean> =
  //
  TypeEq<A, true> extends true
    ? TypeEq<B, true> extends true
      ? true
      : TypeEq<B, false> extends true
        ? false
        : never
    : TypeEq<A, false> extends true
      ? TypeEq<B, true> extends true
        ? false
        : TypeEq<B, false> extends true
          ? true
          : never
      : never;

type BoolNand<A extends boolean, B extends boolean> = BoolNot<BoolAnd<A, B>>;

type BoolNor<A extends boolean, B extends boolean> = BoolNot<BoolOr<A, B>>;

type BoolNeq<A extends boolean, B extends boolean> = BoolNot<BoolEq<A, B>>;
