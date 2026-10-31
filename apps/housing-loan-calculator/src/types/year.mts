import * as t from 'ts-fortress';

export const minYear = 1;

export const maxYear = 100;

/**
 * A borrowing period in whole years. The payment table has a row for every
 * month, so the bound is what keeps a period typed in, or given in the URL,
 * from building a table too large to draw.
 */
export const Year = t.uintRangeInclusive(minYear, maxYear);

export type Year = t.TypeOf<typeof Year>;
