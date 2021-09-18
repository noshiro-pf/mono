export const isInt = (a: number): boolean => Number.isInteger(a);

export const isSafeInt = (a: number): boolean => Number.isSafeInteger(a);

export const isUint32 = (a: number): boolean =>
  Number.isInteger(a) && 0 <= a && a <= 2 ** 32 - 1;
