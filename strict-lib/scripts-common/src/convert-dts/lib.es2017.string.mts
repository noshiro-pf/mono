import type { MonoTypeFunction } from 'ts-type-forge';
import { replaceWithNoMatchCheck } from '../functions/utils/node-utils.mjs';
import type { ConverterOptions } from './common.mjs';

/**
 * Brands the length parameter of `String.prototype.padStart` / `padEnd`.
 * TypeScript 7.0 renamed that parameter from `maxLength` to `targetLength`
 * (aligning the lib with the spec), so the spelling actually present in the
 * file is detected first; every lib file carries exactly one of the two.
 */
export const convertLibEs2017String =
  ({ brandedNumber }: ConverterOptions): MonoTypeFunction<string> =>
  (src) => {
    const paramName = src.includes('targetLength: number')
      ? 'targetLength'
      : 'maxLength';

    return replaceWithNoMatchCheck(
      `${paramName}: number`,
      `${paramName}: ${brandedNumber.StringSizeArgNonNegative}`,
    )(src);
  };
