import { type PositiveInt16 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isPositiveInt16 = (x: number): x is PositiveInt16 =>
  Number.isSafeInteger(x) && x > 0 && x <= 2 ** 15 - 1;

const year = (value: PositiveInt16) => ({ year: value }) as const;

// embed-sample-code-ignore-below
export { isPositiveInt16, year };
