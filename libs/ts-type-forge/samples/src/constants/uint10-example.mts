import { type Uint10 } from 'ts-type-forge';

// embed-sample-code-ignore-above

type TenBitColor = Uint10; // 10-bit color depth
type PortNumber = Uint10; // Some port ranges

const isValid10Bit = (value: number): value is Uint10 =>
  Number.isInteger(value) && value >= 0 && value <= 1023;

// embed-sample-code-ignore-below
export { isValid10Bit };
export type { PortNumber, TenBitColor };
