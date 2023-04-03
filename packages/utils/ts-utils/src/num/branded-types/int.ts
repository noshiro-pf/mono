import { type _SmallInt } from './small-index';
import { toInt, toUint } from './to';

/** return type */
type R = Int;

/** arg type */
type A = _SmallInt | Int;

/** unsigned type */
type U = Uint;

/** signed type */
type S = Int;

/** denominator type */
type D = NonZeroInt | StrictExclude<_SmallInt, 0>;

const to = toInt;
const toU = toUint;
const toS = toInt;

const max = (...values: readonly A[]): R => to(Math.max(...values));
const min = (...values: readonly A[]): R => to(Math.min(...values));
const floor = (x: A): R => to(Math.floor(x));
const ceil = (x: A): R => to(Math.ceil(x));
const abs = (x: A): U => toU(Math.abs(x));
const round = (x: A): R => to(Math.round(x));
const pow = (x: A, y: A): R => to(x ** y);
const add = (x: A, y: A): R => to(x + y);
const sub = (x: A, y: A): S => toS(x - y);
const mul = (x: A, y: A): R => to(x * y);

const div = (x: A, y: D): R => to(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: A, max: A): R =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Int = {
  max,
  min,
  floor,
  ceil,
  abs,
  round,
  pow,
  add,
  sub,
  mul,
  div,
  random,
} as const;
