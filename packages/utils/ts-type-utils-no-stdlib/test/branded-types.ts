import {
  type BigInt64,
  type BigUint64,
  type FiniteNumber,
  type Float32,
  type Float64,
  type InfiniteNumber,
  type Int,
  type Int16,
  type Int16Brand,
  type Int32,
  type Int32Brand,
  type IntBrand,
  type NEGATIVE_INFINITY,
  type NaNType,
  type NegativeNumber,
  type NegativeUint16,
  type NegativeUint32,
  type NonNegativeNumber,
  type NonZeroInt,
  type NonZeroIntBrand,
  type NonZeroNumber,
  type NonZeroSafeInt,
  type NonZeroSafeIntBrand,
  type NormalizeBrandUnion,
  type POSITIVE_INFINITY,
  type PositiveNumber,
  type SafeInt,
  type SafeIntBrand,
  type SafeUint,
  type SafeUintBrand,
  type Uint,
  type Uint16,
  type Uint16Brand,
  type Uint32,
  type Uint32Brand,
  type UintBrand,
} from '../src';
import { expectType } from './expect-type';

{
  // types that extend FiniteNumber
  expectType<FiniteNumber, FiniteNumber>('<=');
  expectType<IntBrand, FiniteNumber>('<=');
  expectType<UintBrand, FiniteNumber>('<=');
  expectType<NonZeroIntBrand, FiniteNumber>('<=');
  expectType<SafeIntBrand, FiniteNumber>('<=');
  expectType<SafeUintBrand, FiniteNumber>('<=');
  expectType<NonZeroSafeIntBrand, FiniteNumber>('<=');
  expectType<Uint32Brand, FiniteNumber>('<=');
  expectType<Int32Brand, FiniteNumber>('<=');
  expectType<Uint16Brand, FiniteNumber>('<=');
  expectType<Int16Brand, FiniteNumber>('<=');

  // types that don't extend FiniteNumber
  expectType<NaNType, FiniteNumber>('!<=');
  expectType<InfiniteNumber, FiniteNumber>('!<=');
  expectType<POSITIVE_INFINITY, FiniteNumber>('!<=');
  expectType<NEGATIVE_INFINITY, FiniteNumber>('!<=');
  expectType<NonZeroNumber, FiniteNumber>('!<=');
  expectType<NonNegativeNumber, FiniteNumber>('!<=');
  expectType<Float32, FiniteNumber>('!<=');
  expectType<Float64, FiniteNumber>('!<=');
  expectType<BigInt64, FiniteNumber>('!<=');
  expectType<BigUint64, FiniteNumber>('!<=');
}

{
  // types that extend FiniteNumber
  expectType<NaNType, NaNType>('<=');

  // types that don't extend NaN
  expectType<FiniteNumber, NaNType>('!<=');
  expectType<NonZeroNumber, NaNType>('!<=');
  expectType<NonNegativeNumber, NaNType>('!<=');
  expectType<InfiniteNumber, NaNType>('!<=');
  expectType<POSITIVE_INFINITY, NaNType>('!<=');
  expectType<NEGATIVE_INFINITY, NaNType>('!<=');
  expectType<Int, NaNType>('!<=');
  expectType<Uint, NaNType>('!<=');
  expectType<NonZeroInt, NaNType>('!<=');
  expectType<SafeInt, NaNType>('!<=');
  expectType<SafeUint, NaNType>('!<=');
  expectType<NonZeroSafeInt, NaNType>('!<=');
  expectType<Uint32, NaNType>('!<=');
  expectType<Int32, NaNType>('!<=');
  expectType<Uint16, NaNType>('!<=');
  expectType<Int16, NaNType>('!<=');
  expectType<Float32, NaNType>('!<=');
  expectType<Float64, NaNType>('!<=');
  expectType<BigInt64, NaNType>('!<=');
  expectType<BigUint64, NaNType>('!<=');
}

{
  // types that extend Int
  expectType<Uint, Int>('<=');
  expectType<NonZeroInt, Int>('<=');
  expectType<SafeInt, Int>('<=');
  expectType<SafeUint, Int>('<=');
  expectType<NonZeroSafeInt, Int>('<=');
  expectType<Uint32, Int>('<=');
  expectType<Int32, Int>('<=');
  expectType<Uint16, Int>('<=');
  expectType<Int16, Int>('<=');

  // types that don't extend Int
  expectType<FiniteNumber, Int>('!<=');
  expectType<NonZeroNumber, Int>('!<=');
  expectType<NonNegativeNumber, Int>('!<=');
  expectType<Float32, Int>('!<=');
  expectType<Float64, Int>('!<=');
  expectType<BigInt64, Int>('!<=');
  expectType<BigUint64, Int>('!<=');
}

{
  // types that extend NonNegativeNumber
  expectType<POSITIVE_INFINITY, NonNegativeNumber>('<=');
  expectType<UintBrand, NonNegativeNumber>('<=');
  expectType<SafeUintBrand, NonNegativeNumber>('<=');
  expectType<Uint32Brand, NonNegativeNumber>('<=');
  expectType<Uint16Brand, NonNegativeNumber>('<=');

  // types that don't extend NonNegativeNumber
  expectType<NEGATIVE_INFINITY, NonNegativeNumber>('!<=');
  expectType<FiniteNumber, NonNegativeNumber>('!<=');
  expectType<NonZeroNumber, NonNegativeNumber>('!<=');
  expectType<Int, NonNegativeNumber>('!<=');
  expectType<NonZeroInt, NonNegativeNumber>('!<=');
  expectType<SafeInt, NonNegativeNumber>('!<=');
  expectType<NonZeroSafeInt, NonNegativeNumber>('!<=');
  expectType<Int32, NonNegativeNumber>('!<=');
  expectType<Int16, NonNegativeNumber>('!<=');
  expectType<Float32, NonNegativeNumber>('!<=');
  expectType<Float64, NonNegativeNumber>('!<=');
  expectType<BigInt64, NonNegativeNumber>('!<=');
  expectType<BigUint64, NonNegativeNumber>('!<=');
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
  expectType<NonZeroIntBrand, NonZeroNumber>('<=');
  expectType<NonZeroSafeIntBrand, NonZeroNumber>('<=');

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

// integer type relations
expectType<NonZeroSafeInt, NonZeroInt>('<=');
expectType<SafeUint, SafeInt>('<=');
expectType<NonZeroSafeInt, SafeInt>('<=');
expectType<Uint32, Uint>('<=');

expectType<Uint16, Uint32>('<=');
expectType<Int16, Int32>('<=');

expectType<Uint32, SafeInt>('<=');
expectType<Uint16, SafeInt>('<=');
expectType<NegativeUint32, SafeInt>('<=');
expectType<NegativeUint16, SafeInt>('<=');
expectType<Int32, SafeInt>('<=');
expectType<Int16, SafeInt>('<=');

expectType<Uint32, SafeUint>('<=');
expectType<Uint16, SafeUint>('<=');

expectType<NormalizeBrandUnion<Uint16Brand | Uint32Brand>, Uint32Brand>('=');
expectType<
  NormalizeBrandUnion<NEGATIVE_INFINITY | POSITIVE_INFINITY>,
  InfiniteNumber
>('=');
expectType<NormalizeBrandUnion<NegativeNumber | PositiveNumber>, NonZeroNumber>(
  '='
);
