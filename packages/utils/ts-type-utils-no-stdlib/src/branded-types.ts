import { type Brand } from './brand';

// number type classes

/** @internal */
type _NaNKey = 'NaN';
/** @internal */
type _FiniteKey = 'Finite';
/** @internal */
type _ZeroKey = 'Zero';
/** @internal */
type _NonNegativeKey = 'NonNegative';

// integer type classes

/** @internal */
type _IntKey = _FiniteKey | 'Int';
/** @internal */
type _SafeIntKey = _IntKey | 'SafeInt';
/** @internal */
type _Int32Key = _SafeIntKey | 'Int32';
/** @internal */
type _Int16Key = _Int32Key | 'Int16';
/** @internal */
type _Uint32Key = _NonNegativeKey | _SafeIntKey | 'Uint32';
/** @internal */
type _Uint16Key = _Uint32Key | 'Uint16';
/** @internal */
type _NegativeUint32Key = _SafeIntKey | 'NegativeUint32';
/** @internal */
type _NegativeUint16Key = _NegativeUint32Key | 'NegativeUint16';

/** @internal */
type _Float32Key = 'Float32';
/** @internal */
type _Float64Key = 'Float64';
/** @internal */
type _BigInt64Key = 'BigInt64';
/** @internal */
type _BigUint64Key = 'BigUint64';

/** Numeric brand type for `NaN` */
export type NaNType = Brand<
  number,
  _NaNKey,
  _FiniteKey | _NonNegativeKey | _ZeroKey
>;

/** Numeric brand type after checking with `Number.isFinite(x)` */
export type FiniteNumber = Brand<number, _FiniteKey, _NaNKey>;

/** Numeric brand type for `Infinity` */
export type InfiniteNumber = Brand<
  number,
  never,
  _FiniteKey | _NaNKey | _ZeroKey
>;

/** Numeric brand type for `Number.POSITIVE_INFINITY` */
export type POSITIVE_INFINITY = Brand<
  number,
  _NonNegativeKey,
  _FiniteKey | _NaNKey | _ZeroKey
>;

/** Numeric brand type for `Number.NEGATIVE_INFINITY` */
export type NEGATIVE_INFINITY = Brand<
  number,
  never,
  _FiniteKey | _NaNKey | _NonNegativeKey | _ZeroKey
>;

/** Numeric brand type after checking with `x != 0` */
export type NonZeroNumber = Brand<number, never, _NaNKey | _ZeroKey>;

/** Numeric brand type after checking with `x >= 0` */
export type NonNegativeNumber = Brand<number, _NonNegativeKey, _NaNKey>;

/** Numeric brand type after checking with `x > 0` */
export type PositiveNumber = Brand<number, _NonNegativeKey, _NaNKey | _ZeroKey>;

/** Numeric brand type after checking with `x < 0` */
export type NegativeNumber = Brand<
  number,
  never,
  _NaNKey | _NonNegativeKey | _ZeroKey
>;

/** Numeric brand type after checking with `Number.isInteger(x)` */
export type Int = Brand<number, _FiniteKey | _IntKey, _NaNKey>;

/** Numeric brand type after checking with `Number.isInteger(x)` and `x >= 0` */
export type Uint = Brand<
  number,
  _FiniteKey | _IntKey | _NonNegativeKey,
  _NaNKey
>;

/** Numeric brand type after checking with `Number.isInteger(x)` and `x != 0` */
export type NonZeroInt = Brand<
  number,
  _FiniteKey | _IntKey,
  _NaNKey | _ZeroKey
>;

/** Numeric brand type after checking with `Number.isSafeInteger(x)` */
export type SafeInt = Brand<number, _FiniteKey | _SafeIntKey, _NaNKey>;

/** Numeric brand type after checking with `Number.isSafeInteger(x)` and `x >= 0` */
export type SafeUint = Brand<number, _NonNegativeKey | _SafeIntKey, _NaNKey>;

/** Numeric brand type after checking with `Number.isSafeInteger(x)` and `x != 0` */
export type NonZeroSafeInt = Brand<number, _SafeIntKey, _NaNKey | _ZeroKey>;

/** Numeric brand type after checking with `Number.isSafeInteger(x)` and `0 <= x <= 2^32 - 1` */
export type Uint32 = Brand<number, _Uint32Key, _NaNKey>;

/** Numeric brand type after checking with `Number.isSafeInteger(x)` and `0 <= x <= 2^16 - 1` */
export type Uint16 = Brand<number, _Uint16Key, _NaNKey>;

/** Numeric brand type after checking with `Number.isSafeInteger(x)` and `-2^32 - 1 <= x < 0` */
export type NegativeUint32 = Brand<
  number,
  _NegativeUint32Key,
  _NaNKey | _ZeroKey
>;

/** Numeric brand type after checking with `Number.isSafeInteger(x)` and `-2^16 - 1 <= x < 0` */
export type NegativeUint16 = Brand<
  number,
  _NegativeUint16Key,
  _NaNKey | _ZeroKey
>;

/** Numeric brand type after checking with `Number.isSafeInteger(x)` and `-2^31 <= x <= 2^31 - 1` */
export type Int32 = Brand<number, _Int32Key, _NaNKey>;

/** Numeric brand type after checking with `Number.isSafeInteger(x)` and `-2^15 <= x <= 2^15 - 1` */
export type Int16 = Brand<number, _Int16Key, _NaNKey>;

/** Numeric brand type of element value of `Float32Array` */
export type Float32 = Brand<number, _Float32Key>;

/** Numeric brand type of element value of `Float64Array` */
export type Float64 = Brand<number, _Float64Key>;

/** Numeric brand type of element value of `BigInt64Array` */
export type BigInt64 = Brand<bigint, _BigInt64Key, _NaNKey>;

/** Numeric brand type of element value of `BigUint64Array` */
export type BigUint64 = Brand<bigint, _BigUint64Key, _NaNKey>;
