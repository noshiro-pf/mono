export const typeUtilsName = 'ts-type-forge';

/**
 * The ts-type-forge number types the converter names through `brandedNumber`.
 * A leaf module, so that `rewrite-ts-type-forge-refs` can read the same list
 * without importing the converter.
 */
export const brandedNumberFromTypeUtils = [
  'FiniteNumber',
  'Int',
  'NaNType',
  'NEGATIVE_INFINITY',
  'POSITIVE_INFINITY',
  'PositiveNumber',
  'NonNegativeNumber',
  'InfiniteNumber',
  'Int16',
  'Uint16',
  'Int32',
  'Uint32',
  'Float16',
  'Float32',
  'Float64',
  'BigInt64',
  'BigUint64',
  'SafeInt',
  'SafeUint',
  'NegativeInt32',
  'NonZeroNumber',
  'NegativeNumber',
  'NonPositiveNumber',
  'PositiveFiniteNumber',
  'NonNegativeFiniteNumber',
  'PositiveInt',
  'NonNegativeInt',
  'NegativeInt',
  'NonPositiveInt',
  'PositiveSafeInt',
  'PositiveUint16',
  'PositiveUint32',
] as const;
