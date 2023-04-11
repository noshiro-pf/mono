import { Num } from '../num';
import { type _SmallInt } from './small-index';

/** return type */
type T = Int32;

/** arg type */
type A = _SmallInt | T;

/** non-negative type */
type Abs = IntersectBrand<T, NonNegativeNumber>;

/** denominator type */
type D = Exclude<_SmallInt, 0> | IntersectBrand<T, NonZeroNumber>;

const MIN_VALUE = -(2 ** 31);
const MAX_VALUE = 2 ** 31 - 1;

const isInt32Range = Num.isInRange(MIN_VALUE, MAX_VALUE);

export const isInt32 = (a: number): a is T =>
  Number.isInteger(a) && isInt32Range(a);

export const toInt32 = (a: number): T => {
  if (!isInt32(a)) {
    throw new TypeError(`Expected integer in [-2^31, 2^31), got: ${a}`);
  }
  return a;
};

const to = toInt32;

const _c = Num.clamp(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): T => to(Math.round(_c(a)));

const abs = (x: A): Abs => to(Math.abs(x)) as Abs;

const max = (...values: readonly A[]): T => to(Math.max(...values));
const min = (...values: readonly A[]): T => to(Math.min(...values));

/** @returns a ** b, but clamped to [-2^31, 2^31) */
const pow = (x: A, y: A): T => clamp(x ** y);

/** @returns a + b, but clamped to [-2^31, 2^31) */
const add = (x: A, y: A): T => clamp(x + y);

/** @returns a - b, but clamped to [-2^31, 2^31) */
const sub = (x: A, y: A): T => clamp(x - y);

/** @returns a * b, but clamped to [-2^31, 2^31) */
const mul = (x: A, y: A): T => clamp(x * y);

/** @returns a / b, but clamped to [-2^31, 2^31) */
const div = (x: A, y: D): T => clamp(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: A, max: A): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Int32 = {
  MIN_VALUE,
  MAX_VALUE,
  abs,
  max,
  min,
  pow,
  add,
  sub,
  mul,
  div,
  random,
  clamp,
} as const;
