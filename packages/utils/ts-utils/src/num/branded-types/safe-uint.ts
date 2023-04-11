import { Num } from '../num';
import { type _SmallUint } from './small-index';

/** return type */
type T = SafeUint;

/** arg type */
type A = _SmallUint | T;

/** denominator type */
type D = Exclude<_SmallUint, 0> | IntersectBrand<T, NonZeroNumber>;

const MIN_VALUE = 0;
const MAX_VALUE = Number.MAX_SAFE_INTEGER;

export const isSafeUint = (a: number): a is T =>
  Number.isSafeInteger(a) && Num.isNonNegative(a);

export const toSafeUint = (a: number): T => {
  if (!isSafeUint(a)) {
    throw new TypeError(`Expected safe non-negative integer, got: ${a}`);
  }
  return a;
};

const to = toSafeUint;

const _c = Num.clamp<number>(toSafeUint(MIN_VALUE), MAX_VALUE);
const clamp = (a: number): T => to(Math.round(_c(a)));

const max = (...values: readonly A[]): T => to(Math.max(...values));
const min = (...values: readonly A[]): T => to(Math.min(...values));

/** @returns a ** b, but clamped to [0, MAX_SAFE_INTEGER] */
const pow = (x: A, y: A): T => clamp(x ** y);

/** @returns a + b, but clamped to [0, MAX_SAFE_INTEGER] */
const add = (x: A, y: A): T => clamp(x + y);

/** @returns a - b, but clamped to [0, MAX_SAFE_INTEGER] */
const sub = (x: A, y: A): T => clamp(x - y);

/** @returns a * b, but clamped to [0, MAX_SAFE_INTEGER] */
const mul = (x: A, y: A): T => clamp(x * y);

/** @returns a / b, but clamped to [0, MAX_SAFE_INTEGER] */
const div = (x: A, y: D): T => clamp(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: A, max: A): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const SafeUint = {
  MIN_VALUE,
  MAX_VALUE,
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
