import { type Int32 } from 'ts-type-forge';

// embed-sample-code-ignore-above

const isInt32 = (x: number): x is Int32 =>
  Number.isSafeInteger(x) && x >= -(2 ** 31) && x <= 2 ** 31 - 1;

const toInt32 = (x: number): Int32 => (x | 0) as Int32;

const bitwiseOr = (a: Int32, b: Int32): Int32 => (a | b) as Int32;

// embed-sample-code-ignore-below
export { bitwiseOr, isInt32, toInt32 };
