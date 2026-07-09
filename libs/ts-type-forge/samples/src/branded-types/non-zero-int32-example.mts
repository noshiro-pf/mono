import { type NonZeroInt32 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonZeroInt32 = (x: number): x is NonZeroInt32 =>
  Number.isSafeInteger(x) && x !== 0 && x >= -(2 ** 31) && x <= 2 ** 31 - 1;

const delta = (change: NonZeroInt32) => ({ delta: change });

// embed-sample-code-ignore-below
export { delta, isNonZeroInt32 };
