import { Num } from '../num';
import { type _SmallUint } from './small-index';
import { toInt32, toUint32 } from './to';

/** return type */
type R = Uint32;

/** arg type */
type A = _SmallUint | Uint32;

/** unsigned type */
type U = Uint32;

/** signed type */
type S = Int32;

/** denominator type */
type D = PositiveInt32 | StrictExclude<_SmallUint, 0>;

const to = toUint32;
const toU = toUint32;
const toS = toInt32;

const clamp = Num.clampToUint32;

const max = (...values: readonly A[]): R => to(Math.max(...values));
const min = (...values: readonly A[]): R => to(Math.min(...values));
const floor = (x: A): R => to(Math.floor(x));
const ceil = (x: A): R => to(Math.ceil(x));
const abs = (x: A): U => toU(Math.abs(x));
const round = (x: A): R => to(Math.round(x));

/** @returns a ** b, but clamped to [0, 2^32) */
const pow = (x: A, y: A): R => to(clamp(x ** y));

/** @returns a + b, but clamped to [0, 2^32) */
const add = (x: A, y: A): R => to(clamp(x + y));

/** @returns a - b, but clamped to (-2^32, 2^32) */
const sub = (x: A, y: A): S => toS(clamp(x - y));

/** @returns a * b, but clamped to [0, 2^32) */
const mul = (x: A, y: A): R => to(clamp(x * y));

/** @returns a / b, but clamped to [0, 2^32) */
const div = (x: A, y: D): R => to(clamp(Math.floor(x / y)));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: A, max: A): R =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

/** @returns a - b, but clamped to [0, 2^32) */
const sub0 = (a: A, b: A): R => max(0, to(a - b));

export const Uint32 = {
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
  clamp,
} as const;
