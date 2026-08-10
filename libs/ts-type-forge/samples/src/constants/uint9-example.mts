import { type Uint9 } from 'ts-type-forge';

// embed-sample-code-ignore-above

type NineBitValue = Uint9;

const validate9Bit = (value: number): value is Uint9 =>
  Number.isInteger(value) && value >= 0 && value <= 511;

// embed-sample-code-ignore-below
export { validate9Bit };
export type { NineBitValue };
