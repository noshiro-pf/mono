import { type Int, type NonNegativeNumber } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonNegative = (x: number): x is NonNegativeNumber => x >= 0;

const sqrt = (x: NonNegativeNumber) => Math.sqrt(x);
// Safe square root without negative input

const arrayIndex = (arr: readonly unknown[], i: NonNegativeNumber & Int) =>
  arr[i];

// embed-sample-code-ignore-below
export { arrayIndex, isNonNegative, sqrt };
