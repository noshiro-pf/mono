import type { Yen } from '../types/index.mjs';

/**
 * A figure in yen as the payment table writes it: `￥1,234,567`. A figure that
 * rounds to 0 is written unsigned, so that a balance ending a hair below 0, as
 * floating point leaves it, is not written `-￥0`. (`signDisplay: 'negative'`
 * would do the same, but older engines throw on it.)
 */
export const formatYen = (value: Yen): string =>
  // `< 0.5` as the formatter rounds, half away from zero.
  yenFormatter.format(Math.abs(value) < 0.5 ? 0 : value);

const yenFormatter = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
});
