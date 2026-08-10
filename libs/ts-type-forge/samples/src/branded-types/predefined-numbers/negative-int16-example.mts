import { type NegativeInt16 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNegativeInt16 = (x: number): x is NegativeInt16 =>
  Number.isSafeInteger(x) && x < 0 && x >= -(2 ** 15);

const relativePosition = (offset: NegativeInt16) => ({ x: offset }) as const;

// embed-sample-code-ignore-below
export { isNegativeInt16, relativePosition };
