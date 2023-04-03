import { Num } from '../num';
import { toInt8, toUint8 } from './to';

/** return type */
type R = Uint8;

/** arg type */
type A = Uint8;

/** unsigned type */
type U = Uint8;

/** signed type */
type S = Int8;

/** denominator type */
type D = StrictExclude<Uint8, 0>;

const to = toUint8;
const toU = toUint8;
const toS = toInt8;

const clamp = (a: number): R => to(Num.clamp(0, 255)(a));

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

export const Uint8 = {
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
