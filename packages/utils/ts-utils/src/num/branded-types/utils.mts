export const castType =
  <BrandedType extends number>(
    is: (n: number) => n is BrandedType,
    typeNameInErrorMessage: string,
  ) =>
  <N extends number>(a: N): BrandedType & N => {
    if (!is(a)) {
      throw new TypeError(`Expected ${typeNameInErrorMessage}, got: ${a}`);
    }
    return a;
  };

export type ToInt<N extends UnknownBrand> = IntersectBrand<N, Int>;

export type ToNonZero<N extends UnknownBrand> = IntersectBrand<
  N,
  NonZeroNumber
>;

export type ToNonZeroIntWithSmallInt<N extends Int> = WithSmallInt<
  CastToInt<ToNonZero<N>>
>;

export type ToNonNegative<N extends UnknownBrand> = IntersectBrand<
  N,
  NonNegativeNumber
>;

type CastToInt<N> = N extends Int ? N : never;
