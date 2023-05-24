import { Num } from '../num';

/** return type */
type T = SafeInt;

/** non-negative type */
type Abs = SafeUint;

/** denominator type */
type D = NonZeroSafeInt;

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

const abs = (x: T): Abs => to(Math.abs(x)) as Abs;

const max = (...values: readonly T[]): T => to(Math.max(...values));
const min = (...values: readonly T[]): T => to(Math.min(...values));

/** @returns a ** b, but clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] */
const pow = (x: T, y: T): T => clamp(x ** y);

/** @returns a + b, but clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] */
const add = (x: T, y: T): T => clamp(x + y);

/** @returns a - b, but clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] */
const sub = (x: T, y: T): T => clamp(x - y);

/** @returns a * b, but clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] */
const mul = (x: T, y: T): T => clamp(x * y);

/** @returns a / b, but clamped to [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER] */
const div = (x: T, y: D): T => clamp(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: T, max: T): T =>
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
