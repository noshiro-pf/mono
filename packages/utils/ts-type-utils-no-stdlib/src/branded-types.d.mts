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
  | 'NaNValue'
  | 'SafeInt';

/** @internal */
type _BrandedNumberBaseType = Brand<number, never, never>;

/** @internal */
type _ExtendNumberBrand<
  B extends _BrandedNumberBaseType,
  T extends RelaxedExclude<_Keys, UnwrapBrandTrueKeys<B>>,
  F extends RelaxedExclude<_Keys, T | UnwrapBrandFalseKeys<B>> = never,
> = Brand<
  GetBrandValuePart<B>,
  T | (UnwrapBrandTrueKeys<B> & string),
  F | (UnwrapBrandFalseKeys<B> & string)
>;

/** Numeric brand type for `NaN` */
type NaNType = _ExtendNumberBrand<
  _BrandedNumberBaseType,
  '!=0' | 'NaNValue',
  _IntRangeKeys | '>=0' | 'Finite' | 'Int' | 'SafeInt'
>;

/** Numeric brand type for numbers except `NaN` */
type ValidNumber = _ExtendNumberBrand<
  _BrandedNumberBaseType,
  never,
  'NaNValue'
>;

/** Numeric brand type for value after checking with `Number.isFinite(x)` */
type FiniteNumber = _ExtendNumberBrand<ValidNumber, 'Finite'>;

/** Numeric brand type for `Infinity` */
type InfiniteNumber = _ExtendNumberBrand<
  ValidNumber,
  '!=0',
  'Finite' | 'Int' | 'SafeInt'
>;

/** Numeric brand type for value after checking with `x != 0` */
type NonZeroNumber = _ExtendNumberBrand<ValidNumber, '!=0'>;

/** Numeric brand type for value after checking with `x >= 0` */
type NonNegativeNumber = _ExtendNumberBrand<
  ValidNumber,
  '> -2^16' | '> -2^32' | '>= -2^15' | '>= -2^31' | '>=0'
>;

/** Numeric brand type for value after checking with `x > 0` */
type PositiveNumber = IntersectBrand<NonZeroNumber, NonNegativeNumber>;

/** Numeric brand type for value after checking with `x < 0` */
type NegativeNumber = _ExtendNumberBrand<
  NonZeroNumber,
  '< 2^15' | '< 2^16' | '< 2^31' | '< 2^32',
  '>=0'
>;

/** Numeric brand type for `Number.POSITIVE_INFINITY` */
type POSITIVE_INFINITY = _ExtendNumberBrand<
  IntersectBrand<InfiniteNumber, PositiveNumber>,
  never,
  '< 2^15' | '< 2^16' | '< 2^31' | '< 2^32'
>;

/** Numeric brand type for `Number.NEGATIVE_INFINITY` */
type NEGATIVE_INFINITY = _ExtendNumberBrand<
  IntersectBrand<InfiniteNumber, NegativeNumber>,
  never,
  '> -2^16' | '> -2^32' | '>= -2^15' | '>= -2^31'
>;

/**
 * Numeric brand type for value after checking with `Number.isFinite(x)` and `x
 * != 0`
 */
type NonZeroFiniteNumber = IntersectBrand<NonZeroNumber, FiniteNumber>;

/**
 * Numeric brand type for value after checking with `Number.isFinite(x)` and `x>
 * = 0`
 */
type NonNegativeFiniteNumber = IntersectBrand<NonNegativeNumber, FiniteNumber>;

/**
 * Numeric brand type for value after checking with `Number.isFinite(x)` and `x>
 * 0`
 */
type PositiveFiniteNumber = IntersectBrand<PositiveNumber, FiniteNumber>;

/**
 * Numeric brand type for value after checking with `Number.isFinite(x)` and `x
 * < 0`
 */
type NegativeFiniteNumber = IntersectBrand<NegativeNumber, FiniteNumber>;

// integer types

/** Numeric brand type for value after checking with `Number.isInteger(x)` */
type Int = _ExtendNumberBrand<FiniteNumber, 'Int'>;

/**
 * Numeric brand type for value after checking with `Number.isInteger(x)` and
 * `x> = 0`
 */
type Uint = IntersectBrand<Int, NonNegativeNumber>;

/**
 * Numeric brand type for value after checking with `Number.isInteger(x)` and
 * `x> 0`
 */
type PositiveInt = IntersectBrand<Int, PositiveNumber>;

/**
 * Numeric brand type for value after checking with `Number.isInteger(x)` and `x
 * < 0`
 */
type NegativeInt = IntersectBrand<Int, NegativeNumber>;

/**
 * Numeric brand type for value after checking with `Number.isInteger(x)` and `x
 * != 0`
 */
type NonZeroInt = IntersectBrand<Int, NonZeroNumber>;

/** Numeric brand type for value after checking with `Number.isSafeInteger(x)` */
type SafeInt = _ExtendNumberBrand<Int, 'SafeInt'>;

/**
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)`
 * and `x >= 0`
 */
type SafeUint = IntersectBrand<SafeInt, NonNegativeNumber>;

/**
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)`
 * and `x > 0`
 */
type PositiveSafeInt = IntersectBrand<SafeInt, PositiveNumber>;

/**
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)`
 * and `x < 0`
 */
type NegativeSafeInt = IntersectBrand<SafeInt, NegativeNumber>;

/**
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)`
 * and `x != 0`
 */
type NonZeroSafeInt = IntersectBrand<SafeInt, NonZeroNumber>;

/**
 * `[-2^31, 2^31 - 1]`
 *
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)`
 * and `-2^31 <= x <= 2^31 - 1`
 */
type Int32 = _ExtendNumberBrand<
  SafeInt,
  '< 2^31' | '< 2^32' | '> -2^32' | '>= -2^31'
>;

/**
 * `[-2^15, 2^15 - 1]`
 *
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)`
 * and `-2^15 <= x <= 2^15 - 1`
 */
type Int16 = _ExtendNumberBrand<
  Int32,
  '< 2^15' | '< 2^16' | '> -2^16' | '>= -2^15'
>;

/**
 * `[0, 2^32 - 1]`
 *
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)`
 * and `0 <= x <= 2^32 - 1`
 */
type Uint32 = _ExtendNumberBrand<SafeUint, '< 2^32'>;

/**
 * `[0, 2^16 - 1]`
 *
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)`
 * and `0 <= x <= 2^16 - 1`
 */
type Uint16 = _ExtendNumberBrand<Uint32, '< 2^16' | '< 2^31'>;

/**
 * `[2^32 + 1, -1]`
 *
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)`
 * and `-2^32 < x < 0`
 */
type NegativeInt32 = _ExtendNumberBrand<
  IntersectBrand<SafeInt, NegativeNumber>,
  '> -2^32'
>;

/**
 * `[2^16 + 1, -1]`
 *
 * Numeric brand type for value after checking with `Number.isSafeInteger(x)`
 * and `-2^16 < x < 0`
 */
type NegativeInt16 = _ExtendNumberBrand<NegativeInt32, '> -2^16' | '>= -2^31'>;

/** Numeric brand type for `Float32Array` element */
type Float32 = _ExtendNumberBrand<_BrandedNumberBaseType, 'Float32'>;

/** Numeric brand type for `Float64Array` element */
type Float64 = _ExtendNumberBrand<_BrandedNumberBaseType, 'Float64'>;

/** Numeric brand type for `BigInt64Array` element */
type BigInt64 = ExtendBrand<ChangeBaseBrand<Int, bigint>, 'BigInt64'>;

/** Numeric brand type for `BigUint64Array` element */
type BigUint64 = ExtendBrand<ChangeBaseBrand<Int, bigint>, 'BigUint64'>;

/** @internal */
type _SmallIntIndexMax = 512;

/**
 * @internal
 * integers in `[1, MaxIndex - 1]`
 */
type _SmallPositiveInt<MaxIndex extends number = _SmallIntIndexMax> = Exclude<
  Index<MaxIndex>,
  0
>;

/**
 * @internal
 * integers in `[-MaxIndex, -1]`
 */
type _SmallNegativeInt<MaxIndex extends number = _SmallIntIndexMax> =
  NegativeIndex<MaxIndex>;

/**
 * Small integers union
 *
 *     - `''`    : integers in `[-MaxIndex, MaxIndex - 1]`
 *     - `'!=0'` : integers in `[-MaxIndex, MaxIndex - 1] \ { 0 }`
 *     - `'<0'`  : integers in `[-MaxIndex, -1]`
 *     - `'<=0'` : integers in `[-MaxIndex, 0]`
 *     - `'>0'`  : integers in `[1, MaxIndex - 1]`
 *     - `'>=0'` : integers in `[0, MaxIndex - 1]`
 *
 * @default MaxIndex = 512
 */
type SmallInt<
  T extends '!=0' | '' | '<=0' | '<0' | '>=0' | '>0' = '',
  MaxIndex extends number = _SmallIntIndexMax,
> =
  TypeEq<T, '<=0'> extends true
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

type SmallUint = SmallInt<'>=0'>;

/**
 * Append optimal small integers union to number type
 *
 *     - `SmallInt`         : integers in `[-512, 511]`
 *     - `SmallUint`        : integers in `[0, 511]`
 *     - `SmallPositiveInt` : integers in `[1, 511]`
 *     - `NonZeroSmallInt`  : integers in `[-512, 511] \ { 0 }`
 *     - `SmallNegativeInt` : integers in `[-512, -1]`
 */
type WithSmallInt<
  N extends Int,
  MaxIndex extends number = _SmallIntIndexMax,
> = WithSmallIntImpl<NormalizeBrandUnion<N>, MaxIndex>;

type WithSmallIntImpl<N extends Int, MaxIndex extends number> =
  | Exclude<
      SmallInt<'', MaxIndex>,
      | (N extends NegativeNumber ? SmallInt<'>=0', MaxIndex> : never)
      | (N extends NonNegativeNumber ? SmallInt<'<0', MaxIndex> : never)
      | (N extends NonZeroNumber ? 0 : never)
    >
  | N;

type IntWithSmallInt = WithSmallInt<Int>;
type SafeIntWithSmallInt = WithSmallInt<SafeInt>;
type UintWithSmallInt = WithSmallInt<Uint>;
type SafeUintWithSmallInt = WithSmallInt<SafeUint>;
type PositiveIntWithSmallInt = WithSmallInt<PositiveInt>;
type PositiveSafeIntWithSmallInt = WithSmallInt<PositiveSafeInt>;
type NegativeIntWithSmallInt = WithSmallInt<NegativeInt>;
type NegativeSafeIntWithSmallInt = WithSmallInt<NegativeSafeInt>;
type NonZeroIntWithSmallInt = WithSmallInt<NonZeroInt>;
type NonZeroSafeIntWithSmallInt = WithSmallInt<NonZeroSafeInt>;

type Int32WithSmallInt = WithSmallInt<Int32>;
type Int16WithSmallInt = WithSmallInt<Int16>;
type Uint32WithSmallInt = WithSmallInt<Uint32>;
type Uint16WithSmallInt = WithSmallInt<Uint16>;
type NegativeInt32WithSmallInt = WithSmallInt<NegativeInt32>;
type NegativeInt16WithSmallInt = WithSmallInt<NegativeInt16>;

type RemoveSmallInt<
  N extends IntWithSmallInt,
  MaxIndex extends number = _SmallIntIndexMax,
> = RelaxedExclude<N, SmallInt<'', MaxIndex>>;
