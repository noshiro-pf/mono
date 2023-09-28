import { Num } from '../num';

const MIN_VALUE = -(2 ** 31);
const MAX_VALUE = 2 ** 31 - 1;

const isInt32Range = Num.isInRangeInclusive(MIN_VALUE, MAX_VALUE);

export const isInt32 = (a: number): a is Int32 =>
  Number.isInteger(a) && isInt32Range(a);

export const toInt32 = (a: number): Int32 => {
  if (!isInt32(a)) {
    throw new TypeError(`Expected integer in [-2^31, 2^31), got: ${a}`);
  }
  return a;
};

const to = toInt32;

const _c = Num.clamp(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): Int32 => to(Math.round(_c(a)));

const abs = (x: Int32WithSmallInt): IntersectBrand<Int32, NonNegativeNumber> =>
  Math.abs(to(x));

const _min = (...values: readonly Int32WithSmallInt[]): Int32 =>
  to(Math.min(...values));

const _max = (...values: readonly Int32WithSmallInt[]): Int32 =>
  to(Math.max(...values));

const pow = (x: Int32WithSmallInt, y: Int32WithSmallInt): Int32 =>
  clamp(x ** y);

const add = (x: Int32WithSmallInt, y: Int32WithSmallInt): Int32 => clamp(x + y);

const sub = (x: Int32WithSmallInt, y: Int32WithSmallInt): Int32 => clamp(x - y);

const mul = (x: Int32WithSmallInt, y: Int32WithSmallInt): Int32 => clamp(x * y);

const div = (
  x: Int32WithSmallInt,
  y: WithSmallInt<IntersectBrand<Int32, NonZeroNumber>>
): Int32 => clamp(Math.floor(x / y));

const random = (min: Int32WithSmallInt, max: Int32WithSmallInt): Int32 =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Int32 = {
  MIN_VALUE,
  MAX_VALUE,
  abs,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[-2^31, 2^31)` */
  pow,

  /** @returns `a + b`, but clamped to `[-2^31, 2^31)` */
  add,

  /** @returns `a - b`, but clamped to `[-2^31, 2^31)` */
  sub,

  /** @returns `a * b`, but clamped to `[-2^31, 2^31)` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[-2^31, 2^31)` */
  div,
} as const;
