import * as t from '@noshiro/io-ts';

export const PercentFloat = t.simpleBrandedNumber('PercentFloat', 0);

/**
 * @example
 *   0.5% , "12.3%"
 */
export type PercentFloat = t.TypeOf<typeof PercentFloat>;
