export const sign = (value: number): -1 | 0 | 1 =>
  value === 0 ? 0 : value < 0 ? -1 : 1;
