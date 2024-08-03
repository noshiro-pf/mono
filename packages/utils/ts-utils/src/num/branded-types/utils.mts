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

export type RemoveNonZeroKey<N extends UnknownBrand> = Brand<
  GetBrandValuePart<N>,
  RelaxedExclude<UnwrapBrandTrueKeys<N>, '!=0'> & string,
  UnwrapBrandFalseKeys<N> & string
>;

type CastToInt<N> = N extends Int ? N : never;

export type NumberClass<
  N extends UnknownBrand,
  classes extends 'int' | 'non-negative' | 'none' | 'positive',
> = Readonly<
  (classes extends 'int'
    ? unknown
    : classes extends 'positive'
      ? {
          floor: (x: N, y: N) => RemoveNonZeroKey<ToInt<N>>;
          ceil: (x: N, y: N) => ToInt<N>;
          round: (x: N, y: N) => RemoveNonZeroKey<ToInt<N>>;
        }
      : {
          floor: (x: N, y: N) => ToInt<N>;
          ceil: (x: N, y: N) => ToInt<N>;
          round: (x: N, y: N) => ToInt<N>;
        }) &
    (classes extends 'non-negative' | 'positive'
      ? unknown
      : {
          abs: (x: N) => N;
        }) & {
      min: (...values: readonly N[]) => N;
      max: (...values: readonly N[]) => N;
      random: (min: N, max: N) => N;
      pow: (x: N, y: N) => N;
      add: (x: N, y: N) => N;
      sub: (x: N, y: N) => N;
      mul: (x: N, y: N) => N;
      div: (x: N, y: ToNonZero<N>) => N;
    }
>;

// type CommonProperties<N extends UnknownBrand> = Readonly<{
//   min: (...values: readonly N[]) => N;
//   max: (...values: readonly N[]) => N;
//   random: (min: N, max: N) => N;
//   pow: (x: N, y: N) => N;
//   add: (x: N, y: N) => N;
//   sub: (x: N, y: N) => N;
//   mul: (x: N, y: N) => N;
//   div: (x: N, y: ToNonZero<N>) => N;
// }>;
