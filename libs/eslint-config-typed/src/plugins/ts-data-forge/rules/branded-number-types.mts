const brandedNumberTypes = [
  'FiniteNumber',
  'Int',
  'Int16',
  'Int32',
  'NonNegativeFiniteNumber',
  'NonNegativeInt16',
  'NonNegativeInt32',
  'NonZeroFiniteNumber',
  'NonZeroInt',
  'NonZeroInt16',
  'NonZeroInt32',
  'NonZeroSafeInt',
  'NonZeroUint16',
  'NonZeroUint32',
  'PositiveFiniteNumber',
  'PositiveInt',
  'PositiveInt16',
  'PositiveInt32',
  'PositiveSafeInt',
  'PositiveUint16',
  'PositiveUint32',
  'SafeInt',
  'SafeUint',
  'Uint',
  'Uint16',
  'Uint32',
] as const;

/**
 * Branded number types from ts-data-forge and their corresponding as* functions
 */
export const brandedNumberTypeNameToFunctionName: ReadonlyMap<
  string,
  `as${string}`
> = new Map(brandedNumberTypes.map((t) => [t, `as${t}`]));
