import { type _SmallUint } from './small-index';
import { toInt, toUint } from './to';

/** return type */
type R = Uint;

/** arg type */
type A = _SmallUint | Uint;

/** unsigned type */
type U = Uint;

/** signed type */
type S = Int;

/** denominator type */
type D = PositiveInt | StrictExclude<_SmallUint, 0>;

const to = toUint;
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

/** @returns a - b, but never less than 0 */
const sub0 = (a: A, b: A): R => max(0, to(a - b));

export const Uint = {
  max,
  min,
  floor,
  ceil,
  abs,
  round,
  pow,
  add,
  sub,
  sub0,
  mul,
  div,
  random,
} as const;
