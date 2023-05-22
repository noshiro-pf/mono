import { type _SmallInt } from './small-index';

/** return type */
type T = Int;

/** arg type */
type A = _SmallInt | T;

/** non-negative type */
type Abs = Uint;

/** denominator type */
type D = Exclude<_SmallInt, 0> | NonZeroInt;

export const toInt = (a: number): T => {
  if (!Number.isInteger(a)) {
    throw new TypeError(`Expected integer, got: ${a}`);
  }
  return a;
};

const to = toInt;

const abs = (x: A): Abs => to(Math.abs(x)) as Abs;

const max = (...values: readonly A[]): T => to(Math.max(...values));
const min = (...values: readonly A[]): T => to(Math.min(...values));

const pow = (x: A, y: A): T => to(x ** y);

const add = (x: A, y: A): T => to(x + y);

const sub = (x: A, y: A): T => to(x - y);

const mul = (x: A, y: A): T => to(x * y);

const div = (x: A, y: D): T => to(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: A, max: A): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Int = {
  abs,
  max,
  min,
  pow,
  add,
  sub,
  mul,
  div,
  random,
} as const;
