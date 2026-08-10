import { type Uint16 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isUint16 = (x: number): x is Uint16 =>
  Number.isSafeInteger(x) && x >= 0 && x <= 2 ** 16 - 1;

const port = (num: Uint16) => ({ port: num }) as const;
const characterCode = (code: Uint16) => String.fromCharCode(code);

// embed-sample-code-ignore-below
export { characterCode, isUint16, port };
