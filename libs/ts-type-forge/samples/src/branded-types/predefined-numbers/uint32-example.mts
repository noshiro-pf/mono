import { type Uint32 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isUint32 = (x: number): x is Uint32 =>
  Number.isSafeInteger(x) && x >= 0 && x <= 2 ** 32 - 1;

const color = (rgba: Uint32) => ({ rgba });
const ipAddress = (ip: Uint32) =>
  `${ip >>> 24}.${(ip >>> 16) & 0xff}.${(ip >>> 8) & 0xff}.${ip & 0xff}`;

// embed-sample-code-ignore-below
export { color, ipAddress, isUint32 };
