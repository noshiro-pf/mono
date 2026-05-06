import { type RelaxedExclude } from '../record/index.mjs';
import {
  type Brand,
  type GetBrandValuePart,
  type UnwrapBrandFalseKeys,
  type UnwrapBrandTrueKeys,
} from './brand.mjs';

/**
 * @internal Distinguish types to avoid conflicts with branded types created
 * outside of `ts-type-utils`.
 *
 * MEMO: [gcanti/io-ts](https://github.com/gcanti/io-ts) uses unique symbol,
 * but ts-type-utils doesn't use it to maintain independence as a type
 * library.
 *
 * The `TSTypeForgeInternals_` prefix marks this as a non-public surface
 * that consumers should not rely on.
 */
export type TSTypeForgeInternals_BrandEncapsulated<B> = B &
  Readonly<{
    'TSTypeForgeInternals--edd2f9ce-7ca5-45b0-9d1a-bd61b9b5d9c3': unknown;
  }>;

/** @internal Default base brand for all numeric brands. */
export type TSTypeForgeInternals_BrandedNumberBaseType = Brand<
  number,
  never,
  never
>;

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
  | 'Finite'
  | 'Float32'
  | 'Float64'
  | 'Int'
  | 'NaNValue'
  | 'SafeInt';

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
