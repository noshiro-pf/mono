import {
  type Brand,
  type ChangeBaseBrand,
  type ExtendBrand,
  type GetBrandValuePart,
  type IntersectBrand,
  type UnwrapBrandFalseKeys,
  type UnwrapBrandTrueKeys,
} from './brand';
import { type Index, type NegativeIndex } from './index-type';
import { type RelaxedExclude, type TypeEq } from './utils';

/** @internal */
type _IntRangeKeys =
  | '< 2^15'
  | '< 2^16'
  | '< 2^31'
  | '< 2^32'
  | '> -2^16'
  | '> -2^32'
  | '>= -2^15'
  | '>= -2^31'
  | '>=0';

/** @internal */
type _Keys =
  | _IntRangeKeys
  | '!=0'
  | 'Finite'
  | 'Float32'
  | 'Float64'
  | 'Int'
  | 'NaN'
  | 'SafeInt';

/** @internal */
type _BrandedNumberBaseType = Brand<number, never, never>;

/** @internal */
type _ExtendNumberBrand<
  B extends _BrandedNumberBaseType,
  T extends RelaxedExclude<_Keys, UnwrapBrandTrueKeys<B>>,
  F extends RelaxedExclude<_Keys, T | UnwrapBrandFalseKeys<B>> = never
> = Brand<
  GetBrandValuePart<B>,
  T | (UnwrapBrandTrueKeys<B> & string),
  F | (UnwrapBrandFalseKeys<B> & string)
>;

/** Numeric brand type for `NaN` */
export type NaNType = _ExtendNumberBrand<
  _BrandedNumberBaseType,
  '!=0' | 'NaN',
  _IntRangeKeys | '>=0' | 'Finite' | 'Int' | 'SafeInt'
>;

/** Numeric brand type for numbers except `NaN` */
export type ValidNumber = _ExtendNumberBrand<
  _BrandedNumberBaseType,
  never,
  'NaN'
>;

/** Numeric brand type for value after checking with `Number.isFinite(x)` */
export type FiniteNumber = _ExtendNumberBrand<ValidNumber, 'Finite'>;

/** Numeric brand type for `Infinity` */
export type InfiniteNumber = _ExtendNumberBrand<
  ValidNumber,
  '!=0',
  'Finite' | 'Int' | 'SafeInt'
>;

/** Numeric brand type for value after checking with `x != 0` */
export type NonZeroNumber = _ExtendNumberBrand<ValidNumber, '!=0'>;

/** Numeric brand type for value after checking with `x >= 0` */
export type NonNegativeNumber = _ExtendNumberBrand<
  ValidNumber,
  '> -2^16' | '> -2^32' | '>= -2^15' | '>= -2^31' | '>=0'
>;

/** Numeric brand type for value after checking with `x > 0` */
export type PositiveNumber = IntersectBrand<NonZeroNumber, NonNegativeNumber>;

/** Numeric brand type for value after checking with `x < 0` */
export type NegativeNumber = _ExtendNumberBrand<
  NonZeroNumber,
  '< 2^15' | '< 2^16' | '< 2^31' | '< 2^32',
  '>=0'
>;

/** Numeric brand type for `Number.POSITIVE_INFINITY` */
export type POSITIVE_INFINITY = _ExtendNumberBrand<
  IntersectBrand<InfiniteNumber, PositiveNumber>,
  never,
  '< 2^15' | '< 2^16' | '< 2^31' | '< 2^32'
>;

/** Numeric brand type for `Number.NEGATIVE_INFINITY` */
export type NEGATIVE_INFINITY = _ExtendNumberBrand<
  IntersectBrand<InfiniteNumber, NegativeNumber>,
  never,
  '> -2^16' | '> -2^32' | '>= -2^15' | '>= -2^31'
>;

/** Numeric brand type for value after checking with `Number.isFinite(x)` and `x != 0` */
export type NonZeroFiniteNumber = IntersectBrand<NonZeroNumber, FiniteNumber>;

/** Numeric brand type for value after checking with `Number.isFinite(x)` and `x >= 0` */
export type NonNegativeFiniteNumber = IntersectBrand<
  NonNegativeNumber,
  FiniteNumber
>;

/** Numeric brand type for value after checking with `Number.isFinite(x)` and `x > 0` */
export type PositiveFiniteNumber = IntersectBrand<PositiveNumber, FiniteNumber>;

/** Numeric brand type for value after checking with `Number.isFinite(x)` and `x < 0` */
export type NegativeFiniteNumber = IntersectBrand<NegativeNumber, FiniteNumber>;

// integer types

/** Numeric brand type for value after checking with `Number.isInteger(x)` */
export type Int = _ExtendNumberBrand<FiniteNumber, 'Int'>;

/** Numeric brand type for value after checking with `Number.isInteger(x)` and `x >= 0` */
export type Uint = IntersectBrand<Int, NonNegativeNumber>;

/** Numeric brand type for value after checking with `Number.isInteger(x)` and `x > 0` */
export type PositiveInt = IntersectBrand<Int, PositiveNumber>;

/** Numeric brand type for value after checking with `Number.isInteger(x)` and `x < 0` */
export type NegativeInt = IntersectBrand<Int, NegativeNumber>;

/** Numeric brand type for value after checking with `Number.isInteger(x)` and `x != 0` */
export type NonZeroInt = IntersectBrand<Int, NonZeroNumber>;

/** Numeric brand type for value after checking with `Number.isSafeInteger(x)` */
export type SafeInt = _ExtendNumberBrand<Int, 'SafeInt'>;

/** Numeric brand type for value after checking with `Number.isSafeInteger(x)` and `x >= 0` */
export type SafeUint = IntersectBrand<SafeInt, NonNegativeNumber>;

/** Numeric brand type for value after checking with `Number.isSafeInteger(x)` and `x > 0` */
export type PositiveSafeInt = IntersectBrand<SafeInt, PositiveNumber>;

/** Numeric brand type for value after checking with `Number.isSafeInteger(x)` and `x < 0` */
export type NegativeSafeInt = IntersectBrand<SafeInt, NegativeNumber>;

/** Numeric brand type for value after checking with `Number.isSafeInteger(x)` and `x != 0` */
export type NonZeroSafeInt = IntersectBrand<SafeInt, NonZeroNumber>;

/**
 * `[-2^31, 2^31 - 1]`
 *
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)` and `-2^31 <= x <= 2^31 - 1` */
export type Int32 = _ExtendNumberBrand<
  SafeInt,
  '< 2^31' | '< 2^32' | '> -2^32' | '>= -2^31'
>;

/**
 * `[-2^15, 2^15 - 1]`
 *
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)` and `-2^15 <= x <= 2^15 - 1` */
export type Int16 = _ExtendNumberBrand<
  Int32,
  '< 2^15' | '< 2^16' | '> -2^16' | '>= -2^15'
>;

/**
 * `[0, 2^32 - 1]`
 *
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)` and `0 <= x <= 2^32 - 1` */
export type Uint32 = _ExtendNumberBrand<SafeUint, '< 2^32'>;

/**
 * `[0, 2^16 - 1]`
 *
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)` and `0 <= x <= 2^16 - 1` */
export type Uint16 = _ExtendNumberBrand<Uint32, '< 2^16' | '< 2^31'>;

/**
 * `[2^32 + 1, -1]`
 *
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)` and `-2^32 < x < 0` */
export type NegativeInt32 = _ExtendNumberBrand<
  IntersectBrand<SafeInt, NegativeNumber>,
  '> -2^32'
>;

/**
 * `[2^16 + 1, -1]`
 *
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)` and `-2^16 < x < 0` */
export type NegativeInt16 = _ExtendNumberBrand<
  NegativeInt32,
  '> -2^16' | '>= -2^31'
>;

/** Numeric brand type for `Float32Array` element */
export type Float32 = _ExtendNumberBrand<_BrandedNumberBaseType, 'Float32'>;

/** Numeric brand type for `Float64Array` element */
export type Float64 = _ExtendNumberBrand<_BrandedNumberBaseType, 'Float64'>;

/** Numeric brand type for `BigInt64Array` element */
export type BigInt64 = ExtendBrand<ChangeBaseBrand<Int, bigint>, 'BigInt64'>;

/** Numeric brand type for `BigUint64Array` element */
export type BigUint64 = ExtendBrand<ChangeBaseBrand<Int, bigint>, 'BigUint64'>;

/** @internal */
type _SmallIntIndexMax = 512;

/**
 * @internal
 * integers in `[1, MaxIndex - 1]` */
type _SmallPositiveInt<MaxIndex extends number> = RelaxedExclude<
  Index<MaxIndex>,
  0
>;

/**
 * @internal
 * integers in `[-MaxIndex, -1]` */
type _SmallNegativeInt<MaxIndex extends number> = NegativeIndex<MaxIndex>;

/**
 * small integers union
 *
 * - `''`    : integers in `[-MaxIndex, MaxIndex - 1]`
 * - `'!=0'` : integers in `[-MaxIndex, MaxIndex - 1] \ { 0 }`
 * - `'<0'`  : integers in `[-MaxIndex, -1]`
 * - `'<=0'` : integers in `[-MaxIndex, 0]`
 * - `'>0'`  : integers in `[1, MaxIndex - 1]`
 * - `'>=0'` : integers in `[0, MaxIndex - 1]`
 *
 * @default MaxIndex = 512
 */
export type SmallInt<
  T extends '!=0' | '' | '<=0' | '<0' | '>=0' | '>0' = '',
  MaxIndex extends number = _SmallIntIndexMax
> = TypeEq<T, '<=0'> extends true
  ? _SmallNegativeInt<MaxIndex> | 0
  : TypeEq<T, '<0'> extends true
  ? _SmallNegativeInt<MaxIndex>
  : TypeEq<T, '>=0'> extends true
  ? _SmallPositiveInt<MaxIndex> | 0
  : TypeEq<T, '>0'> extends true
  ? _SmallPositiveInt<MaxIndex>
  : TypeEq<T, '!=0'> extends true
  ? _SmallNegativeInt<MaxIndex> | _SmallPositiveInt<MaxIndex>
  : TypeEq<T, ''> extends true
  ? _SmallNegativeInt<MaxIndex> | _SmallPositiveInt<MaxIndex> | 0
  : never;

export type SmallUint = SmallInt<'>=0'>;

/**
 * append optimal small integers union to number type
 *
 * - `SmallInt`         : integers in `[-512, 511]`
 * - `SmallUint`        : integers in `[0, 511]`
 * - `SmallPositiveInt` : integers in `[1, 511]`
 * - `NonZeroSmallInt`  : integers in `[-512, 511] \ { 0 }`
 * - `SmallNegativeInt` : integers in `[-512, -1]`
 */
export type WithSmallInt<
  N extends Int,
  MaxIndex extends number = _SmallIntIndexMax
> =
  | Exclude<
      SmallInt<'', MaxIndex>,
      | (N extends NegativeNumber ? SmallInt<'>=0', MaxIndex> : never)
      | (N extends NonNegativeNumber ? SmallInt<'<0', MaxIndex> : never)
      | (N extends NonZeroInt ? 0 : never)
    >
  | N;

export type IntWithSmallInt = WithSmallInt<Int>;
export type SafeIntWithSmallInt = WithSmallInt<SafeInt>;
export type UintWithSmallInt = WithSmallInt<Uint>;
export type SafeUintWithSmallInt = WithSmallInt<SafeUint>;
export type PositiveIntWithSmallInt = WithSmallInt<PositiveInt>;
export type PositiveSafeIntWithSmallInt = WithSmallInt<PositiveSafeInt>;
export type NegativeIntWithSmallInt = WithSmallInt<NegativeInt>;
export type NegativeSafeIntWithSmallInt = WithSmallInt<NegativeSafeInt>;
export type NonZeroIntWithSmallInt = WithSmallInt<NonZeroInt>;
export type NonZeroSafeIntWithSmallInt = WithSmallInt<NonZeroSafeInt>;

export type Int32WithSmallInt = WithSmallInt<Int32>;
export type Int16WithSmallInt = WithSmallInt<Int16>;
export type Uint32WithSmallInt = WithSmallInt<Uint32>;
export type Uint16WithSmallInt = WithSmallInt<Uint16>;
export type NegativeInt32WithSmallInt = WithSmallInt<NegativeInt32>;
export type NegativeInt16WithSmallInt = WithSmallInt<NegativeInt16>;

export type RemoveSmallInt<
  N extends IntWithSmallInt,
  MaxIndex extends number = _SmallIntIndexMax
> = RelaxedExclude<N, SmallInt<'', MaxIndex>>;
