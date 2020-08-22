export const roundAt = (val: number, precision: number): number => {
  const digit = 10 ** precision;
  return Math.round(val * digit) / digit;
};
