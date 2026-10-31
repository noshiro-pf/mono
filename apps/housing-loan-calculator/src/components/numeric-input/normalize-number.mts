/**
 * The number a numeric input of the page commits for `n`, which `NumericInput`
 * has already clamped to the input's bounds: rounded to a whole number for
 * `integer`, and `fallback` for the `NaN` of text that is no number.
 */
export const normalizeNumber =
  ({
    fallback,
    integer,
  }: Readonly<{
    fallback: number;
    integer: boolean;
  }>) =>
  (n: number): number =>
    Number.isNaN(n) ? fallback : integer ? Math.round(n) : n;
