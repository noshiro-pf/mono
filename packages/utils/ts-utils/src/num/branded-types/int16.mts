import { Num } from '../num.mjs';

const MIN_VALUE = -(2 ** 15);
const MAX_VALUE = 2 ** 15 - 1;

const isInt16Range = Num.isInRangeInclusive(MIN_VALUE, MAX_VALUE);

export const isInt16 = (a: number): a is Int16 =>
  Number.isInteger(a) && isInt16Range(a);

export const toInt16 = (a: number): Int16 => {
  if (!isInt16(a)) {
    throw new TypeError(`Expected integer in [-2^15, 2^15), got: ${a}`);
  }
  return a;
};

const to = toInt16;

const _c = Num.clamp(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): Int16 => to(Math.round(_c(a)));

const abs = (x: Int16WithSmallInt): IntersectBrand<Int16, NonNegativeNumber> =>
  Math.abs(to(x));

const _min = (...values: readonly Int16WithSmallInt[]): Int16 =>
  to(Math.min(...values));

const _max = (...values: readonly Int16WithSmallInt[]): Int16 =>
  to(Math.max(...values));

const pow = (x: Int16WithSmallInt, y: Int16WithSmallInt): Int16 =>
  clamp(x ** y);

const add = (x: Int16WithSmallInt, y: Int16WithSmallInt): Int16 => clamp(x + y);

const sub = (x: Int16WithSmallInt, y: Int16WithSmallInt): Int16 => clamp(x - y);

const mul = (x: Int16WithSmallInt, y: Int16WithSmallInt): Int16 => clamp(x * y);

const div = (
  x: Int16WithSmallInt,
  y: WithSmallInt<IntersectBrand<Int16, NonZeroNumber>>,
): Int16 => clamp(Math.floor(x / y));

const random = (min: Int16WithSmallInt, max: Int16WithSmallInt): Int16 =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Int16 = {
  MIN_VALUE,
  MAX_VALUE,
  abs,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[-2^15, 2^15)` */
  pow,

  /** @returns `a + b`, but clamped to `[-2^15, 2^15)` */
  add,

  /** @returns `a - b`, but clamped to `[-2^15, 2^15)` */
  sub,

  /** @returns `a * b`, but clamped to `[-2^15, 2^15)` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[-2^15, 2^15)` */
  div,
} as const;
