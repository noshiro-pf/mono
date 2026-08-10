import { type NonZeroInt16 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonZeroInt16 = (x: number): x is NonZeroInt16 =>
  Number.isSafeInteger(x) && x !== 0 && x >= -(2 ** 15) && x <= 2 ** 15 - 1;

const offset = (value: NonZeroInt16) => ({ offset: value }) as const;

// embed-sample-code-ignore-below
export { isNonZeroInt16, offset };
