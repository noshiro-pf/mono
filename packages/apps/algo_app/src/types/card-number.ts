export type CardNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export const isCardNumber = (data: unknown): data is CardNumber =>
  typeof data === 'number' && Num.isInt(data) && Num.isInRange(0, 11)(data);
