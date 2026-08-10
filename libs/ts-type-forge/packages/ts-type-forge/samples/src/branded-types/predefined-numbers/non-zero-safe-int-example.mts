import { type NonZeroSafeInt, type SafeInt } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonZeroSafeInt = (x: number): x is NonZeroSafeInt =>
  Number.isSafeInteger(x) && x !== 0;

const step = (current: SafeInt, increment: NonZeroSafeInt): SafeInt =>
  (current + increment) as SafeInt;

// embed-sample-code-ignore-below
export { isNonZeroSafeInt, step };
