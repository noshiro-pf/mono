export const roundBy = (digit: number, value: number): number =>
  Math.round(value * 10 ** digit) / 10 ** digit;
