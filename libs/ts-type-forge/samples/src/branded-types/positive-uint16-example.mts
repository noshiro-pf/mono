import { type PositiveUint16 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isPositiveUint16 = (x: number): x is PositiveUint16 =>
  Number.isSafeInteger(x) && x > 0 && x <= 2 ** 16 - 1;

const tcpPort = (port: PositiveUint16) => ({ port });

// embed-sample-code-ignore-below
export { isPositiveUint16, tcpPort };
