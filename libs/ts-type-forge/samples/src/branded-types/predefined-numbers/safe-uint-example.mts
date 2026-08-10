import { type SafeUint } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isSafeUint = (x: number): x is SafeUint =>
  Number.isSafeInteger(x) && x >= 0;

const fileSize = (bytes: SafeUint) => ({ bytes }) as const;
const timestamp = (): SafeUint => Date.now() as SafeUint;

// embed-sample-code-ignore-below
export { fileSize, isSafeUint, timestamp };
