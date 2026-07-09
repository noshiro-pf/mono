import { type Int, type NonZeroInt } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isNonZeroInt = (x: number): x is NonZeroInt =>
  Number.isInteger(x) && x !== 0;

const modulo = (a: Int, b: NonZeroInt) => a % b;
const gcd = (a: NonZeroInt, b: NonZeroInt): NonZeroInt =>
  b === 0 ? a : gcd(b, (a % b) as NonZeroInt);

// embed-sample-code-ignore-below
export { gcd, isNonZeroInt, modulo };
