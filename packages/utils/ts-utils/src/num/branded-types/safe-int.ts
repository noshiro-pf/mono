import { Num } from '../num';
import { type _SmallInt } from './small-index';

/** return type */
type T = SafeInt;

/** arg type */
type A = _SmallInt | T;

/** non-negative type */
type Abs = SafeUint;

/** denominator type */
type D = Exclude<_SmallInt, 0> | NonZeroSafeInt;

const MIN_VALUE = Number.MIN_SAFE_INTEGER;
const MAX_VALUE = Number.MAX_SAFE_INTEGER;

export const toSafeInt = (a: number): T => {
  if (!Number.isSafeInteger(a)) {
    throw new TypeError(`Expected safe integer, got: ${a}`);
  }
  return a;
};

const to = toSafeInt;

const _c = Num.clamp<number>(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): T => to(Math.round(_c(a)));

const abs = (x: A): Abs => to(Math.abs(x)) as Abs;

const max = (...values: readonly A[]): T => to(Math.max(...values));
const min = (...values: readonly A[]): T => to(Math.min(...values));

/** @returns a ** b, but clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] */
const pow = (x: A, y: A): T => clamp(x ** y);

/** @returns a + b, but clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] */
const add = (x: A, y: A): T => clamp(x + y);

/** @returns a - b, but clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] */
const sub = (x: A, y: A): T => clamp(x - y);

/** @returns a * b, but clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] */
const mul = (x: A, y: A): T => clamp(x * y);

/** @returns a / b, but clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] */
const div = (x: A, y: D): T => clamp(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: A, max: A): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const SafeInt = {
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
