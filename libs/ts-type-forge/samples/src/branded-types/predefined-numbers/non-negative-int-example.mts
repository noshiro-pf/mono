import { type NonNegativeInt } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonNegativeInt = (x: number): x is NonNegativeInt =>
  Number.isInteger(x) && x >= 0;

const arrayIndex = (arr: readonly unknown[], i: NonNegativeInt) => arr[i];
const count = (items: NonNegativeInt) => ({ count: items }) as const;

// embed-sample-code-ignore-below
export { arrayIndex, count, isNonNegativeInt };
