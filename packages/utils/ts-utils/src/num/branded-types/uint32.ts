import { Num } from '../num';
import { type _SmallUint } from './small-index';

/** return type */
type T = Uint32;

/** arg type */
type A = _SmallUint | T;

/** denominator type */
type D = Exclude<_SmallUint, 0> | IntersectBrand<T, NonZeroNumber>;

const MIN_VALUE = 0;
const MAX_VALUE = 2 ** 32 - 1;

const isUint32Range = Num.isInRange(MIN_VALUE, MAX_VALUE);

export const isUint32 = (a: number): a is T =>
  Number.isInteger(a) && isUint32Range(a);

export const toUint32 = (a: number): T => {
  if (!isUint32(a)) {
    throw new TypeError(
      `Expected non-negative integer less than 2^32, got: ${a}`
    );
  }
  return a;
};

const to = toUint32;

const _c = Num.clamp(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): T => to(Math.round(_c(a)));

const max = (...values: readonly A[]): T => to(Math.max(...values));
const min = (...values: readonly A[]): T => to(Math.min(...values));

/** @returns a ** b, but clamped to [0, 2^32) */
const pow = (x: A, y: A): T => clamp(x ** y);

/** @returns a + b, but clamped to [0, 2^32) */
const add = (x: A, y: A): T => clamp(x + y);

/** @returns a - b, but clamped to [0, 2^32) */
const sub = (x: A, y: A): T => clamp(x - y);

/** @returns a * b, but clamped to [0, 2^32) */
const mul = (x: A, y: A): T => clamp(x * y);

/** @returns a / b, but clamped to [0, 2^32) */
const div = (x: A, y: D): T => clamp(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: A, max: A): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Uint32 = {
  MIN_VALUE,
  MAX_VALUE,
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
