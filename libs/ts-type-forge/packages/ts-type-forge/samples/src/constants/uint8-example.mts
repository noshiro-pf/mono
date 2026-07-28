import { type Uint8 } from 'ts-type-forge';

// embed-sample-code-ignore-above

type RedChannel = Uint8; // 0-255 for RGB red component
type ByteValue = Uint8; // Single byte representation

const isValidUint8 = (value: number): value is Uint8 =>
  Number.isInteger(value) && value >= 0 && value <= 255;

// embed-sample-code-ignore-below
export { isValidUint8 };
export type { ByteValue, RedChannel };
