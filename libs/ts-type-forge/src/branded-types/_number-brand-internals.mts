import { type RelaxedExclude } from '../others/index.mjs';
import {
  type Brand,
  type GetBrandValuePart,
  type UnwrapBrandFalseKeys,
  type UnwrapBrandTrueKeys,
} from './brand.mjs';

/** Recognized boolean keys for numeric brands. */
type NumberBrandKey =
  | '!=0'
  | '< 2^15'
  | '< 2^16'
  | '< 2^31'
  | '< 2^32'
  | '> -2^16'
  | '> -2^32'
  | '>= -2^15'
  | '>= -2^31'
  | '>=0'
  | '<=0'
  | 'Finite'
  | 'Float32'
  | 'Float64'
  | 'Int'
  | 'NaNValue'
  | 'SafeInt';

/** @internal Default base brand for all numeric brands. */
export type TSTypeForgeInternals_BrandedNumberBaseType = Brand<
  number,
  never,
  never
>;

/**
 * @internal Extends a numeric brand with additional `true`/`false` keys.
 * Constrains keys to the recognized {@link NumberBrandKey} union so that
 * sized integer brands stay consistent.
 */
export type TSTypeForgeInternals_ExtendNumberBrand<
  B extends TSTypeForgeInternals_BrandedNumberBaseType,
  T extends RelaxedExclude<NumberBrandKey, UnwrapBrandTrueKeys<B>>,
  F extends RelaxedExclude<NumberBrandKey, T | UnwrapBrandFalseKeys<B>> = never,
> = Brand<
  GetBrandValuePart<B>,
  T | (UnwrapBrandTrueKeys<B> & string),
  F | (UnwrapBrandFalseKeys<B> & string)
>;
