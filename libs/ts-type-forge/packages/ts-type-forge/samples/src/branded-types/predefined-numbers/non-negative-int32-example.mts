import { type NonNegativeInt32 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonNegativeInt32 = (x: number): x is NonNegativeInt32 =>
  Number.isSafeInteger(x) && x >= 0 && x <= 2 ** 31 - 1;

const score = (points: NonNegativeInt32) => ({ score: points });

// embed-sample-code-ignore-below
export { isNonNegativeInt32, score };
