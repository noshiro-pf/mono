import { Num } from '../num';
import { type _SmallUint } from './small-index';
import { toSafeInt, toSafeUint } from './to';

/** return type */
type R = SafeUint;

/** arg type */
type A = _SmallUint | SafeUint;

/** unsigned type */
type U = SafeUint;

/** signed type */
type S = SafeInt;

/** denominator type */
type D = PositiveSafeInt | StrictExclude<_SmallUint, 0>;

const to = toSafeUint;
const toU = toSafeUint;
const toS = toSafeInt;

const clamp = Num.clamp(Num.MIN_SAFE_INTEGER, Num.MAX_SAFE_INTEGER);

const max = (...values: readonly A[]): R => to(Math.max(...values));
const min = (...values: readonly A[]): R => to(Math.min(...values));
const floor = (x: A): R => to(Math.floor(x));
const ceil = (x: A): R => to(Math.ceil(x));
const abs = (x: A): U => toU(Math.abs(x));
const round = (x: A): R => to(Math.round(x));

/** @returns a ** b, but clamped to [0, MAX_SAFE_INTEGER] */
const pow = (x: A, y: A): R => to(clamp(x ** y));

/** @returns a + b, but clamped to [0, MAX_SAFE_INTEGER] */
const add = (x: A, y: A): R => to(clamp(x + y));

/** @returns a - b, but clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] */
const sub = (x: A, y: A): S => toS(clamp(x - y));

/** @returns a * b, but clamped to [0, MAX_SAFE_INTEGER] */
const mul = (x: A, y: A): R => to(clamp(x * y));

/** @returns a / b, but clamped to [0, MAX_SAFE_INTEGER] */
const div = (x: A, y: D): R => to(clamp(Math.floor(x / y)));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: A, max: A): R =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

/** @returns a - b, but clamped to [0, MAX_SAFE_INTEGER] */
const sub0 = (a: A, b: A): R => max(0, to(a - b));

export const SafeUint = {
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
