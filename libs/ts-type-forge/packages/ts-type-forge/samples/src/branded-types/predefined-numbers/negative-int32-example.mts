import { type NegativeInt32 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNegativeInt32 = (x: number): x is NegativeInt32 =>
  Number.isSafeInteger(x) && x < 0 && x >= -(2 ** 31);

const offset = (value: NegativeInt32) => ({ offset: value });

// embed-sample-code-ignore-below
export { isNegativeInt32, offset };
