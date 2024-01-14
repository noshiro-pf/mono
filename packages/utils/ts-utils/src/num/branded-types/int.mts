import { toFiniteNumber } from './finite-number.mjs';

export const toInt = (a: number): Int => {
  if (!Number.isInteger(a)) {
    throw new TypeError(`Expected integer, got: ${a}`);
  }
  return a;
};

const to = toInt;

const abs = (x: IntWithSmallInt): Uint => Math.abs(toInt(x));

const _min = (...values: readonly IntWithSmallInt[]): Int =>
  to(Math.min(...values));

const _max = (...values: readonly IntWithSmallInt[]): Int =>
  to(Math.max(...values));

const pow = (x: IntWithSmallInt, y: IntWithSmallInt): Int => to(x ** y);

const add = (x: IntWithSmallInt, y: IntWithSmallInt): Int => to(x + y);

const sub = (x: IntWithSmallInt, y: IntWithSmallInt): Int => to(x - y);

const mul = (x: IntWithSmallInt, y: IntWithSmallInt): Int => to(x * y);

const div = (x: IntWithSmallInt, y: NonZeroIntWithSmallInt): Int =>
  Math.floor(toFiniteNumber(x / y));

const random = (min: IntWithSmallInt, max: IntWithSmallInt): Int =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Int = {
  abs,

  min: _min,
  max: _max,

  random,

  /** @returns `a ** b` */
  pow,

  /** @returns `a + b` */
  add,

  /** @returns `a - b` */
  sub,

  /** @returns `a * b` */
  mul,

  /** @returns `⌊a / b⌋` */
  div,
} as const;
