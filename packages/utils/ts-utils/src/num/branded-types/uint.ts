import { Num } from '../num';
import { type _SmallUint } from './small-index';

/** return type */
type T = Uint;

/** arg type */
type A = _SmallUint | T;

/** denominator type */
type D = Exclude<_SmallUint, 0> | IntersectBrand<T, NonZeroNumber>;

export const isUint = (a: number): a is T =>
  Number.isInteger(a) && Num.isNonNegative(a);

export const toUint = (a: number): T => {
  if (!isUint(a)) {
    throw new TypeError(`Expected non-negative integer, got: ${a}`);
  }
  return a;
};

const to = toUint;

const max = (...values: readonly A[]): T => to(Math.max(...values));
const min = (...values: readonly A[]): T => to(Math.min(...values));

const pow = (x: A, y: A): T => to(x ** y);

const add = (x: A, y: A): T => to(x + y);

/** @returns a - b, but never less than 0 */
const sub = (x: A, y: A): T => to(Math.max(0, x - y));

const mul = (x: A, y: A): T => to(x * y);

const div = (x: A, y: D): T => to(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: A, max: A): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Uint = {
  max,
  min,
  pow,
  add,
  sub,
  mul,
  div,
  random,
} as const;
