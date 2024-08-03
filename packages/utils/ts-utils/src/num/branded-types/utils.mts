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
export type ToNonZeroIntWithSmallInt<N extends Int> = WithSmallInt<
  Cast<IntersectBrand<N, NonZeroNumber>>
>;
export type ToNonNegative<N extends UnknownBrand> = IntersectBrand<
  N,
  NonNegativeNumber
>;

type Cast<N> = N extends Int ? N : never;
