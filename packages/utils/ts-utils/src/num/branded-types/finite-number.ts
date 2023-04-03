// eslint-disable-next-line import/no-cycle
import { toNonNegativeNumber } from './non-negative-number';
import { toFiniteNumber } from './to';

/** return type */
type R = FiniteNumber;

/** arg type */
type A = FiniteNumber;

/** unsigned type */
type U = NonNegativeNumber;

/** signed type */
type S = FiniteNumber;

/** denominator type */
type D = NonZeroNumber;

const to = toFiniteNumber;
const toU = toNonNegativeNumber;
const toS = toFiniteNumber;

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

export const FiniteNumber = {
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
