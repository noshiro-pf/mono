import { expectType } from './expect-type.mjs';

{
  expectType<
    NaNType,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: true;
        Finite: false;
        Int: false;
        SafeInt: false;
        '!=0': true;
        '< 2^15': false;
        '< 2^16': false;
        '< 2^31': false;
        '< 2^32': false;
        '> -2^16': false;
        '> -2^32': false;
        '>= -2^15': false;
        '>= -2^31': false;
        '>=0': false;
      }>
    > &
      number
  >('=');

  expectType<
    InfiniteNumber,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: false;
        '!=0': true;
        Int: false;
        SafeInt: false;
      }>
    > &
      number
  >('=');

  expectType<
    POSITIVE_INFINITY,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: false;
        '!=0': true;
        Int: false;
        SafeInt: false;
        '>=0': true;
        '>= -2^15': true;
        '> -2^16': true;
        '>= -2^31': true;
        '> -2^32': true;
        '< 2^15': false;
        '< 2^16': false;
        '< 2^31': false;
        '< 2^32': false;
      }>
    > &
      number
  >('=');

  expectType<
    NEGATIVE_INFINITY,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: false;
        '!=0': true;
        Int: false;
        SafeInt: false;
        '>=0': false;
        '>= -2^15': false;
        '> -2^16': false;
        '>= -2^31': false;
        '> -2^32': false;
        '< 2^15': true;
        '< 2^16': true;
        '< 2^31': true;
        '< 2^32': true;
      }>
    > &
      number
  >('=');

  expectType<POSITIVE_INFINITY, PositiveNumber>('<=');
  expectType<NEGATIVE_INFINITY, NegativeNumber>('<=');

  expectType<
    NonZeroNumber,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        '!=0': true;
      }>
    > &
      number
  >('=');

  expectType<
    NonNegativeNumber,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        '>=0': true;
        '> -2^16': true;
        '> -2^32': true;
        '>= -2^15': true;
        '>= -2^31': true;
      }>
    > &
      number
  >('=');

  expectType<
    PositiveNumber,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        '!=0': true;
        // '< 2^15': true;
        // '< 2^16': true;
        // '< 2^31': true;
        // '< 2^32': true;
        '> -2^16': true;
        '> -2^32': true;
        '>= -2^15': true;
        '>= -2^31': true;
        '>=0': true;
      }>
    > &
      number
  >('=');

  expectType<PositiveNumber, NonNegativeNumber>('<=');
  expectType<NegativeNumber & PositiveNumber, never>('=');

  expectType<
    NegativeNumber,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        '!=0': true;
        '< 2^15': true;
        '< 2^16': true;
        '< 2^31': true;
        '< 2^32': true;
        // '> -2^16': true;
        // '> -2^32': true;
        // '>= -2^15': true;
        // '>= -2^31': true;
        '>=0': false;
      }>
    > &
      number
  >('=');

  expectType<
    FiniteNumber,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
      }>
    > &
      number
  >('=');

  // integer types

  expectType<
    Int,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
      }>
    > &
      number
  >('=');

  expectType<
    Uint,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        // '!=0': true;
        // '< 2^15': true;
        // '< 2^16': true;
        // '< 2^31': true;
        // '< 2^32': true;
        '> -2^16': true;
        '> -2^32': true;
        '>= -2^15': true;
        '>= -2^31': true;
        '>=0': true;
      }>
    > &
      number
  >('=');

  expectType<
    PositiveInt,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        '!=0': true;
        // '< 2^15': true;
        // '< 2^16': true;
        // '< 2^31': true;
        // '< 2^32': true;
        '> -2^16': true;
        '> -2^32': true;
        '>= -2^15': true;
        '>= -2^31': true;
        '>=0': true;
      }>
    > &
      number
  >('=');

  expectType<
    NegativeInt,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        '!=0': true;
        '< 2^15': true;
        '< 2^16': true;
        '< 2^31': true;
        '< 2^32': true;
        // '> -2^16': true;
        // '> -2^32': true;
        // '>= -2^15': true;
        // '>= -2^31': true;
        '>=0': false;
      }>
    > &
      number
  >('=');

  expectType<
    NonZeroInt,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        '!=0': true;
      }>
    > &
      number
  >('=');

  expectType<
    SafeInt,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        SafeInt: true;
      }>
    > &
      number
  >('=');

  expectType<
    SafeUint,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        SafeInt: true;
        // '!=0': true;
        // '< 2^15': true;
        // '< 2^16': true;
        // '< 2^31': true;
        // '< 2^32': true;
        '> -2^16': true;
        '> -2^32': true;
        '>= -2^15': true;
        '>= -2^31': true;
        '>=0': true;
      }>
    > &
      number
  >('=');

  expectType<
    PositiveSafeInt,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        SafeInt: true;
        '!=0': true;
        // '< 2^15': true;
        // '< 2^16': true;
        // '< 2^31': true;
        // '< 2^32': true;
        '> -2^16': true;
        '> -2^32': true;
        '>= -2^15': true;
        '>= -2^31': true;
        '>=0': true;
      }>
    > &
      number
  >('=');

  expectType<
    NegativeSafeInt,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        '!=0': true;
        SafeInt: true;
        '< 2^15': true;
        '< 2^16': true;
        '< 2^31': true;
        '< 2^32': true;
        // '> -2^16': true;
        // '> -2^32': true;
        // '>= -2^15': true;
        // '>= -2^31': true;
        '>=0': false;
      }>
    > &
      number
  >('=');

  expectType<
    NonZeroSafeInt,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        SafeInt: true;
        '!=0': true;
      }>
    > &
      number
  >('=');

  expectType<
    Int32,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        SafeInt: true;
        // '!=0': true;
        // '< 2^15': true;
        // '< 2^16': true;
        '< 2^31': true;
        '< 2^32': true;
        // '> -2^16': true;
        '> -2^32': true;
        // '>= -2^15': true;
        '>= -2^31': true;
        // '>=0': true;
      }>
    > &
      number
  >('=');

  expectType<
    Int16,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        SafeInt: true;
        // '!=0': true;
        '< 2^15': true;
        '< 2^16': true;
        '< 2^31': true;
        '< 2^32': true;
        '> -2^16': true;
        '> -2^32': true;
        '>= -2^15': true;
        '>= -2^31': true;
        // '>=0': true;
      }>
    > &
      number
  >('=');

  expectType<
    Uint32,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        SafeInt: true;
        // '!=0': true;
        // '< 2^15': true;
        // '< 2^16': true;
        // '< 2^31': true;
        '< 2^32': true;
        '> -2^16': true;
        '> -2^32': true;
        '>= -2^15': true;
        '>= -2^31': true;
        '>=0': true;
      }>
    > &
      number
  >('=');

  expectType<
    Uint16,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        SafeInt: true;
        // '!=0': true;
        // '< 2^15': true;
        '< 2^16': true;
        '< 2^31': true;
        '< 2^32': true;
        '> -2^16': true;
        '> -2^32': true;
        '>= -2^15': true;
        '>= -2^31': true;
        '>=0': true;
      }>
    > &
      number
  >('=');

  expectType<
    NegativeInt32,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        SafeInt: true;
        '!=0': true;
        '< 2^15': true;
        '< 2^16': true;
        '< 2^31': true;
        '< 2^32': true;
        // '> -2^16': true;
        '> -2^32': true;
        // '>= -2^15': true;
        // '>= -2^31': true;
        '>=0': false;
      }>
    > &
      number
  >('=');

  expectType<
    NegativeInt16,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Int: true;
        SafeInt: true;
        '!=0': true;
        '< 2^15': true;
        '< 2^16': true;
        '< 2^31': true;
        '< 2^32': true;
        '> -2^16': true;
        '> -2^32': true;
        // '>= -2^15': true;
        '>= -2^31': true;
        '>=0': false;
      }>
    > &
      number
  >('=');

  expectType<
    Float32,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        Float32: true;
      }>
    > &
      number
  >('=');

  expectType<
    Float64,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        Float64: true;
      }>
    > &
      number
  >('=');

  expectType<
    BigInt64,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        Finite: true;
        Int: true;
        NaNValue: false;
        BigInt64: true;
      }>
    > &
      bigint
  >('=');

  expectType<
    BigUint64,
    TSTypeUtilsInternals.BrandEncapsulated<
      Readonly<{
        Finite: true;
        Int: true;
        NaNValue: false;
        BigUint64: true;
      }>
    > &
      bigint
  >('=');
}

{
  const op = '!<=';
  expectType<InfiniteNumber, NaNType>(op);
  expectType<POSITIVE_INFINITY, NaNType>(op);
  expectType<NEGATIVE_INFINITY, NaNType>(op);
  expectType<NonZeroNumber, NaNType>(op);
  expectType<NonNegativeNumber, NaNType>(op);
  expectType<PositiveNumber, NaNType>(op);
  expectType<NegativeNumber, NaNType>(op);
  expectType<FiniteNumber, NaNType>(op);
  expectType<Int, NaNType>(op);
  expectType<Uint, NaNType>(op);
  expectType<NonZeroInt, NaNType>(op);
  expectType<SafeInt, NaNType>(op);
  expectType<SafeUint, NaNType>(op);
  expectType<NonZeroSafeInt, NaNType>(op);
  expectType<Int32, NaNType>(op);
  expectType<Int16, NaNType>(op);
  expectType<Uint32, NaNType>(op);
  expectType<Uint16, NaNType>(op);
  expectType<NegativeInt32, NaNType>(op);
  expectType<NegativeInt16, NaNType>(op);
  expectType<Float32, NaNType>(op);
  expectType<Float64, NaNType>(op);
  expectType<BigInt64, NaNType>(op);
  expectType<BigUint64, NaNType>(op);
}

{
  {
    // types that extend FiniteNumber
    const op = '<=';

    expectType<Int, FiniteNumber>(op);
    expectType<Uint, FiniteNumber>(op);
    expectType<NonZeroInt, FiniteNumber>(op);
    expectType<SafeInt, FiniteNumber>(op);
    expectType<SafeUint, FiniteNumber>(op);
    expectType<NonZeroSafeInt, FiniteNumber>(op);
    expectType<Int32, FiniteNumber>(op);
    expectType<Int16, FiniteNumber>(op);
    expectType<Uint32, FiniteNumber>(op);
    expectType<Uint16, FiniteNumber>(op);
    expectType<NegativeInt32, FiniteNumber>(op);
    expectType<NegativeInt16, FiniteNumber>(op);
  }
  {
    // types that don't extend FiniteNumber
    const op = '!<=';

    expectType<NaNType, FiniteNumber>(op);
    expectType<InfiniteNumber, FiniteNumber>(op);
    expectType<POSITIVE_INFINITY, FiniteNumber>(op);
    expectType<NEGATIVE_INFINITY, FiniteNumber>(op);
    expectType<NonZeroNumber, FiniteNumber>(op);
    expectType<NonNegativeNumber, FiniteNumber>(op);
    expectType<PositiveNumber, FiniteNumber>(op);
    expectType<NegativeNumber, FiniteNumber>(op);
    expectType<Float32, FiniteNumber>(op);
    expectType<Float64, FiniteNumber>(op);
    expectType<BigInt64, FiniteNumber>(op);
    expectType<BigUint64, FiniteNumber>(op);
  }
}

{
  {
    // types that extend Int
    const op = '<=';
    expectType<Int, Int>(op);
    expectType<Uint, Int>(op);
    expectType<NonZeroInt, Int>(op);
    expectType<SafeInt, Int>(op);
    expectType<SafeUint, Int>(op);
    expectType<NonZeroSafeInt, Int>(op);
    expectType<Int32, Int>(op);
    expectType<Int16, Int>(op);
    expectType<Uint32, Int>(op);
    expectType<Uint16, Int>(op);
    expectType<NegativeInt32, Int>(op);
    expectType<NegativeInt16, Int>(op);
  }
  {
    // types that don't extend Int
    const op = '!<=';
    expectType<InfiniteNumber, Int>(op);
    expectType<POSITIVE_INFINITY, Int>(op);
    expectType<NEGATIVE_INFINITY, Int>(op);
    expectType<NonZeroNumber, Int>(op);
    expectType<NonNegativeNumber, Int>(op);
    expectType<PositiveNumber, Int>(op);
    expectType<NegativeNumber, Int>(op);
    expectType<FiniteNumber, Int>(op);
    expectType<Float32, Int>(op);
    expectType<Float64, Int>(op);
    expectType<BigInt64, Int>(op);
    expectType<BigUint64, Int>(op);
  }
}

{
  {
    // types that extend Int
    const op = '<=';
    expectType<Uint, NonNegativeNumber>(op);
    expectType<SafeUint, NonNegativeNumber>(op);
    expectType<Uint32, NonNegativeNumber>(op);
    expectType<Uint16, NonNegativeNumber>(op);
    expectType<POSITIVE_INFINITY, NonNegativeNumber>(op);
    expectType<NonNegativeNumber, NonNegativeNumber>(op);
    expectType<PositiveNumber, NonNegativeNumber>(op);
  }
  {
    // types that don't extend Int
    const op = '!<=';
    expectType<InfiniteNumber, NonNegativeNumber>(op);
    expectType<NEGATIVE_INFINITY, NonNegativeNumber>(op);
    expectType<NonZeroNumber, NonNegativeNumber>(op);
    expectType<NegativeNumber, NonNegativeNumber>(op);
    expectType<FiniteNumber, NonNegativeNumber>(op);
    expectType<Int, NonNegativeNumber>(op);
    expectType<NonZeroInt, NonNegativeNumber>(op);
    expectType<SafeInt, NonNegativeNumber>(op);
    expectType<NonZeroSafeInt, NonNegativeNumber>(op);
    expectType<Int32, NonNegativeNumber>(op);
    expectType<Int16, NonNegativeNumber>(op);
    expectType<NegativeInt32, NonNegativeNumber>(op);
    expectType<NegativeInt16, NonNegativeNumber>(op);
    expectType<Float32, NonNegativeNumber>(op);
    expectType<Float64, NonNegativeNumber>(op);
    expectType<BigInt64, NonNegativeNumber>(op);
    expectType<BigUint64, NonNegativeNumber>(op);
  }
}

{
  // types that extend Uint
  expectType<SafeUint, Uint>('<=');
  expectType<Uint32, Uint>('<=');
  expectType<Uint16, Uint>('<=');

  // types that don't extend Uint
  expectType<FiniteNumber, Uint>('!<=');
  expectType<NonZeroNumber, Uint>('!<=');
  expectType<NonNegativeNumber, Uint>('!<=');
  expectType<Int, Uint>('!<=');
  expectType<NonZeroInt, Uint>('!<=');
  expectType<SafeInt, Uint>('!<=');
  expectType<NonZeroSafeInt, Uint>('!<=');
  expectType<Int32, Uint>('!<=');
  expectType<Int16, Uint>('!<=');
  expectType<Float32, Uint>('!<=');
  expectType<Float64, Uint>('!<=');
  expectType<BigInt64, Uint>('!<=');
  expectType<BigUint64, Uint>('!<=');
}

{
  // types that extend NonZeroNumber
  expectType<InfiniteNumber, NonZeroNumber>('<=');
  expectType<POSITIVE_INFINITY, NonZeroNumber>('<=');
  expectType<NEGATIVE_INFINITY, NonZeroNumber>('<=');
  expectType<NonZeroInt, NonZeroNumber>('<=');
  expectType<NonZeroSafeInt, NonZeroNumber>('<=');

  // types that don't extend NonZeroNumber
  expectType<FiniteNumber, NonZeroNumber>('!<=');
  expectType<NonNegativeNumber, NonZeroNumber>('!<=');
  expectType<Int, NonZeroNumber>('!<=');
  expectType<Uint, NonZeroNumber>('!<=');
  expectType<SafeInt, NonZeroNumber>('!<=');
  expectType<SafeUint, NonZeroNumber>('!<=');
  expectType<Uint32, NonZeroNumber>('!<=');
  expectType<Int32, NonZeroNumber>('!<=');
  expectType<Uint16, NonZeroNumber>('!<=');
  expectType<Int16, NonZeroNumber>('!<=');
  expectType<Float32, NonZeroNumber>('!<=');
  expectType<Float64, NonZeroNumber>('!<=');
  expectType<BigInt64, NonZeroNumber>('!<=');
  expectType<BigUint64, NonZeroNumber>('!<=');
}

{
  // other subset relationships
  expectType<POSITIVE_INFINITY, PositiveNumber>('<=');
  expectType<NEGATIVE_INFINITY, NegativeNumber>('<=');

  expectType<NonZeroSafeInt, NonZeroInt>('<=');
  expectType<SafeUint, SafeInt>('<=');
  expectType<NonZeroSafeInt, SafeInt>('<=');
  expectType<Uint32, Uint>('<=');

  expectType<Uint16, Uint32>('<=');
  expectType<Int16, Int32>('<=');

  expectType<Uint32, SafeInt>('<=');
  expectType<Uint16, SafeInt>('<=');
  expectType<NegativeInt32, SafeInt>('<=');
  expectType<NegativeInt16, SafeInt>('<=');
  expectType<Int32, SafeInt>('<=');
  expectType<Int16, SafeInt>('<=');

  expectType<Uint32, SafeUint>('<=');
  expectType<Uint16, SafeUint>('<=');
}

{
  // Cases that result in an empty set

  expectType<NaNType & ValidNumber, never>('=');
  expectType<NegativeNumber & NonNegativeNumber, never>('=');
  expectType<NegativeNumber & PositiveNumber, never>('=');
  expectType<NegativeInt & PositiveInt, never>('=');
  expectType<NegativeSafeInt & PositiveSafeInt, never>('=');
  expectType<NEGATIVE_INFINITY & POSITIVE_INFINITY, never>('=');
  expectType<FiniteNumber & InfiniteNumber, never>('=');
}

{
  // NormalizeBrandUnion

  expectType<NormalizeBrandUnion<Uint16 | Uint32>, Uint32>('=');
  expectType<
    NormalizeBrandUnion<NEGATIVE_INFINITY | POSITIVE_INFINITY>,
    InfiniteNumber
  >('=');
  expectType<
    NormalizeBrandUnion<NegativeNumber | PositiveNumber>,
    NonZeroNumber
  >('=');
  expectType<
    NormalizeBrandUnion<NegativeNumber | NonNegativeNumber>,
    ValidNumber
  >('=');
}

{
  expectType<SmallInt<'', 4>, -1 | -2 | -3 | -4 | 0 | 1 | 2 | 3>('=');
  expectType<SmallInt<'<0', 4>, -1 | -2 | -3 | -4>('=');
  expectType<SmallInt<'<=0', 4>, -1 | -2 | -3 | -4 | 0>('=');
  expectType<SmallInt<'>=0', 4>, 0 | 1 | 2 | 3>('=');
  expectType<SmallInt<'>0', 4>, 1 | 2 | 3>('=');
}

{
  // SmallInt with default value

  expectType<0, SmallInt<''>>('<=');
  expectType<0, SmallInt<'<0'>>('!<=');
  expectType<0, SmallInt<'<=0'>>('<=');
  expectType<0, SmallInt<'>=0'>>('<=');
  expectType<0, SmallInt<'>0'>>('!<=');

  expectType<-1, SmallInt<''>>('<=');
  expectType<-1, SmallInt<'<0'>>('<=');
  expectType<-1, SmallInt<'<=0'>>('<=');
  expectType<-1, SmallInt<'>=0'>>('!<=');
  expectType<-1, SmallInt<'>0'>>('!<=');

  expectType<39, SmallInt<''>>('<=');
  expectType<39, SmallInt<'<0'>>('!<=');
  expectType<39, SmallInt<'<=0'>>('!<=');
  expectType<39, SmallInt<'>=0'>>('<=');
  expectType<39, SmallInt<'>0'>>('<=');

  expectType<40, SmallInt<''>>('!<=');
  expectType<40, SmallInt<'<0'>>('!<=');
  expectType<40, SmallInt<'<=0'>>('!<=');
  expectType<40, SmallInt<'>=0'>>('!<=');
  expectType<40, SmallInt<'>0'>>('!<=');

  expectType<-40, SmallInt<''>>('<=');
  expectType<-40, SmallInt<'<0'>>('<=');
  expectType<-40, SmallInt<'<=0'>>('<=');
  expectType<-40, SmallInt<'>=0'>>('!<=');
  expectType<-40, SmallInt<'>0'>>('!<=');

  expectType<-41, SmallInt<''>>('!<=');
  expectType<-41, SmallInt<'<0'>>('!<=');
  expectType<-41, SmallInt<'<=0'>>('!<=');
  expectType<-41, SmallInt<'>=0'>>('!<=');
  expectType<-41, SmallInt<'>0'>>('!<=');
}

{
  expectType<WithSmallInt<Int>, Int | SmallInt>('=');
  expectType<WithSmallInt<SafeInt>, SafeInt | SmallInt>('=');
  expectType<WithSmallInt<Int32>, Int32 | SmallInt>('=');
  expectType<WithSmallInt<Int16>, Int16 | SmallInt>('=');

  expectType<WithSmallInt<NonZeroInt>, NonZeroInt | SmallInt<'!=0'>>('=');
  expectType<WithSmallInt<NonZeroSafeInt>, NonZeroSafeInt | SmallInt<'!=0'>>(
    '=',
  );

  expectType<WithSmallInt<Uint>, SmallInt<'>=0'> | Uint>('=');
  expectType<WithSmallInt<SafeUint>, SafeUint | SmallInt<'>=0'>>('=');
  expectType<WithSmallInt<Uint32>, SmallInt<'>=0'> | Uint32>('=');
  expectType<WithSmallInt<Uint16>, SmallInt<'>=0'> | Uint16>('=');

  expectType<WithSmallInt<NegativeInt32>, NegativeInt32 | SmallInt<'<0'>>('=');
  expectType<WithSmallInt<NegativeInt16>, NegativeInt16 | SmallInt<'<0'>>('=');
}
