import { type NonZeroUint32 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonZeroUint32 = (x: number): x is NonZeroUint32 =>
  Number.isSafeInteger(x) && x > 0 && x <= 2 ** 32 - 1;

const divisor = (value: NonZeroUint32) => 1000000 / value;

// embed-sample-code-ignore-below
export { divisor, isNonZeroUint32 };
