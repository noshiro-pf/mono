// Keep this list in sync with the `as<Type>` cast functions exported by
// ts-data-forge. `pnpm run check:branded-number-types` (also run during the
// build) fails if a branded number type is missing here or no longer exists.
const brandedNumberTypes = [
  'FiniteNumber',
  'Int',
  'Int16',
  'Int32',
  'Int8',
  'NegativeFiniteNumber',
  'NegativeInt',
  'NegativeSafeInt',
  'NonNegativeFiniteNumber',
  'NonNegativeInt16',
  'NonNegativeInt32',
  'NonPositiveFiniteNumber',
  'NonPositiveInt',
  'NonPositiveSafeInt',
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
  'Uint8',
] as const;

/**
 * Branded number types from ts-data-forge and their corresponding as* functions
 */
export const brandedNumberTypeNameToFunctionName: ReadonlyMap<
  string,
  `as${string}`
> = new Map(brandedNumberTypes.map((t) => [t, `as${t}`]));
