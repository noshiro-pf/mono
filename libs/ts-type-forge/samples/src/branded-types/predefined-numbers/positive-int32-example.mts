import { type PositiveInt32 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isPositiveInt32 = (x: number): x is PositiveInt32 =>
  Number.isSafeInteger(x) && 0 < x && x <= 2 ** 31 - 1;

const userId = (id: PositiveInt32) => ({ userId: id });

// embed-sample-code-ignore-below
export { isPositiveInt32, userId };
