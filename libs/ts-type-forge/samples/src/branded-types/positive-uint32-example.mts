import { type PositiveUint32 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isPositiveUint32 = (x: number): x is PositiveUint32 =>
  Number.isSafeInteger(x) && x > 0 && x <= 2 ** 32 - 1;

const id = (value: PositiveUint32) => ({ id: value });

// embed-sample-code-ignore-below
export { id, isPositiveUint32 };
