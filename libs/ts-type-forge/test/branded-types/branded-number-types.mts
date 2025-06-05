import { expectType } from '../expect-type.mjs';

{
  expectType<
    NaNType,
    TSTypeForgeInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: true;
        Finite: false;
        Float64: false;
        Float32: false;
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        '!=0': true;
      }>
    > &
      number
  >('=');

  expectType<
    NonNegativeNumber,
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Float64: false;
        Float32: false;
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
  >('!=');

  expectType<
    NegativeInt16,
    TSTypeForgeInternals.BrandEncapsulated<
      Readonly<{
        NaNValue: false;
        Finite: true;
        Float64: false;
        Float32: false;
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
  >('!=');

  expectType<
    Float32,
    TSTypeForgeInternals.BrandEncapsulated<
      Readonly<{
        Float32: true;
      }>
    > &
      number
  >('=');

  expectType<
    Float64,
    TSTypeForgeInternals.BrandEncapsulated<
      Readonly<{
        Float64: true;
      }>
    > &
      number
  >('=');

  expectType<
    BigInt64,
    TSTypeForgeInternals.BrandEncapsulated<
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
    TSTypeForgeInternals.BrandEncapsulated<
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

// Intersection type inclusion relationships (set theory tests)
{
  // Int types with sign constraints should be included in corresponding specialized types

  // Int & NonNegativeNumber = Uint (they are equivalent sets)
  expectType<Int & NonNegativeNumber, Uint>('~=');

  // Int & PositiveNumber = PositiveInt (they are equivalent sets)
  expectType<Int & PositiveNumber, PositiveInt>('~=');

  // Int & NegativeNumber = NegativeInt (they are equivalent sets)
  expectType<Int & NegativeNumber, NegativeInt>('~=');

  // Int & NonZeroNumber = NonZeroInt (they are equivalent sets)
  expectType<Int & NonZeroNumber, NonZeroInt>('~=');
}

{
  // SafeInt types with sign constraints should be included in corresponding specialized types

  // SafeInt & NonNegativeNumber = SafeUint (they are equivalent sets)
  expectType<SafeInt & NonNegativeNumber, SafeUint>('~=');

  // SafeInt & PositiveNumber = PositiveSafeInt (they are equivalent sets)
  expectType<SafeInt & PositiveNumber, PositiveSafeInt>('~=');

  // SafeInt & NegativeNumber = NegativeSafeInt (they are equivalent sets)
  expectType<SafeInt & NegativeNumber, NegativeSafeInt>('~=');

  // SafeInt & NonZeroNumber = NonZeroSafeInt (they are equivalent sets)
  expectType<SafeInt & NonZeroNumber, NonZeroSafeInt>('~=');
}

{
  // Sized integer types with sign constraints should be included in unsigned variants

  // Int16 & NonNegativeNumber ⊂ Uint16 (proper subset: Int16 includes negatives, Uint16 doesn't)
  expectType<Int16 & NonNegativeNumber, Uint16>('<=');

  // Int32 & NonNegativeNumber ⊂ Uint32 (proper subset: Int32 includes negatives, Uint32 doesn't)
  expectType<Int32 & NonNegativeNumber, Uint32>('<=');

  // Int16 & NegativeNumber ⊂ NegativeInt16 (proper subset due to range constraints)
  expectType<Int16 & NegativeNumber, NegativeInt16>('<=');

  // Int32 & NegativeNumber ⊂ NegativeInt32 (proper subset due to range constraints)
  expectType<Int32 & NegativeNumber, NegativeInt32>('<=');
}

{
  // Cross-constraint intersections between different type dimensions

  // Uint & SafeInt = SafeUint (they are equivalent sets)
  expectType<Uint & SafeInt, SafeUint>('~=');

  // PositiveInt & SafeInt = PositiveSafeInt (they are equivalent sets)
  expectType<PositiveInt & SafeInt, PositiveSafeInt>('~=');

  // NegativeInt & SafeInt = NegativeSafeInt (they are equivalent sets)
  expectType<NegativeInt & SafeInt, NegativeSafeInt>('~=');

  // NonZeroInt & SafeInt = NonZeroSafeInt (they are equivalent sets)
  expectType<NonZeroInt & SafeInt, NonZeroSafeInt>('~=');
}

{
  // Size hierarchies with additional constraints

  // Int16 & Uint = Uint16 (they are equivalent sets)
  expectType<Int16 & Uint, Uint16>('<=');

  // Int32 & Uint = Uint32 (they are equivalent sets)
  expectType<Int32 & Uint, Uint32>('<=');

  // Uint16 & SafeInt = Uint16 (Uint16 is already within SafeInt range)
  expectType<Uint16 & SafeInt, Uint16>('~=');

  // Uint32 & SafeInt = Uint32 (Uint32 is already within SafeInt range)
  expectType<Uint32 & SafeInt, Uint32>('~=');
}

{
  // More complex intersection relationships

  // Int32 & PositiveNumber ⊆ PositiveInt (and should also ⊆ Uint32 since positive)
  expectType<Int32 & PositiveNumber, PositiveInt>('<=');
  expectType<Int32 & PositiveNumber, Uint32>('<=');

  // Int16 & PositiveNumber ⊆ PositiveInt (and should also ⊆ Uint16 since positive)
  expectType<Int16 & PositiveNumber, PositiveInt>('<=');
  expectType<Int16 & PositiveNumber, Uint16>('<=');

  // SafeInt & NonNegativeNumber & Int32 ⊆ Uint32 (triple intersection)
  expectType<SafeInt & NonNegativeNumber & Int32, Uint32>('<=');

  // SafeInt & NonNegativeNumber & Int16 ⊆ Uint16 (triple intersection)
  expectType<SafeInt & NonNegativeNumber & Int16, Uint16>('<=');
}

{
  // Finite number intersections

  // FiniteNumber & NonZeroNumber = NonZeroFiniteNumber (they are equivalent sets)
  expectType<FiniteNumber & NonZeroNumber, NonZeroFiniteNumber>('~=');

  // FiniteNumber & NonNegativeNumber = NonNegativeFiniteNumber (they are equivalent sets)
  expectType<FiniteNumber & NonNegativeNumber, NonNegativeFiniteNumber>('~=');

  // FiniteNumber & PositiveNumber = PositiveFiniteNumber (they are equivalent sets)
  expectType<FiniteNumber & PositiveNumber, PositiveFiniteNumber>('~=');

  // FiniteNumber & NegativeNumber = NegativeFiniteNumber (they are equivalent sets)
  expectType<FiniteNumber & NegativeNumber, NegativeFiniteNumber>('~=');
}

{
  // Transitivity tests - if A ⊆ B and B ⊆ C, then A ⊆ C

  // Since Uint16 ≤ Uint32 ≤ SafeUint ≤ SafeInt ≤ Int ≤ FiniteNumber
  expectType<Uint16, FiniteNumber>('<=');
  expectType<Uint32, FiniteNumber>('<=');
  expectType<SafeUint, FiniteNumber>('<=');

  // Since Int16 ≤ Int32 ≤ SafeInt ≤ Int ≤ FiniteNumber
  expectType<Int16, FiniteNumber>('<=');
  expectType<Int32, FiniteNumber>('<=');

  // Since NegativeInt16 ≤ NegativeInt32 ≤ NegativeSafeInt ≤ NegativeInt ≤ Int
  expectType<NegativeInt16, Int>('<=');
  expectType<NegativeInt32, Int>('<=');
  expectType<NegativeSafeInt, Int>('<=');
}

{
  // Edge cases and boundary conditions

  // Empty intersections (should result in never)
  expectType<Uint & NegativeNumber, never>('=');
  expectType<PositiveInt & NegativeNumber, never>('=');
  expectType<Uint16 & NegativeNumber, never>('=');
  expectType<Uint32 & NegativeNumber, never>('=');
  expectType<SafeUint & NegativeNumber, never>('=');
  expectType<PositiveSafeInt & NegativeNumber, never>('=');

  // Non-integer intersections - these should be impossible combinations
  expectType<Float32 & Int, never>('!=');
  expectType<Float64 & Int, never>('!=');
  expectType<InfiniteNumber & Int, never>('=');
  expectType<NaNType & ValidNumber, never>('=');
}

{
  // WithSmallInt intersection relationships
  // Note: These relationships are more complex due to the literal union structure

  // The branded parts should maintain the intersection relationships where they make sense
  expectType<WithSmallInt<Uint>, WithSmallInt<Int>>('<=');
  expectType<WithSmallInt<SafeUint>, WithSmallInt<SafeInt>>('<=');
  // Note: Uint16/Int16 and Uint32/Int32 relationships are complex with WithSmallInt
  // because the literal parts have different constraints

  // Verify that small literal parts work correctly
  expectType<SmallInt<'>=0'>, WithSmallInt<Uint>>('<=');
  expectType<SmallInt<'>0'>, WithSmallInt<PositiveInt>>('<=');
  expectType<SmallInt<'<0'>, WithSmallInt<NegativeInt>>('<=');
}
