import * as t from '@noshiro/io-ts';

export const percentFloatType = t.simpleBrandedNumber('PercentFloat', 0);

export const toPercentFloat = percentFloatType.cast;

/**
 * @example
 *   0.5% , "12.3%"
 */
export type PercentFloat = t.TypeOf<typeof percentFloatType>;
