import { Num } from '../num';

/** return type */
type T = Uint8;

/** arg type */
type A = T;

/** denominator type */
type D = Exclude<Uint8, 0>;

const MIN_VALUE = 0;
const MAX_VALUE = 255;

const _r = Num.isInRangeInclusive(MIN_VALUE, MAX_VALUE);
const isInUint8Range = (a: number): a is Uint8 => Number.isInteger(a) && _r(a);

export const toUint8 = (a: number): Uint8 => {
  if (!isInUint8Range(a)) {
    throw new TypeError(
      `Expected non-negative integer less than ${MAX_VALUE}, got: ${a}`
    );
  }
  return a;
};

const to = toUint8;

const _c = Num.clamp<number>(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): T => to(Math.round(_c(a)));

const _min = (...values: readonly A[]): T => to(Math.min(...values));

const _max = (...values: readonly A[]): T => to(Math.max(...values));

const pow = (x: A, y: A): T => clamp(x ** y);

const add = (x: A, y: A): T => clamp(x + y);

const sub = (x: A, y: A): T => clamp(x - y);

const mul = (x: A, y: A): T => clamp(x * y);

const div = (x: A, y: D): T => clamp(Math.floor(x / y));

const random = (min: A, max: A): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Uint8 = {
  MIN_VALUE,
  MAX_VALUE,

  max: _max,
  min: _min,
  clamp,

  random,

  /** @returns a ** b, but clamped to [0, 255] */
  pow,

  /** @returns a + b, but clamped to [0, 255] */
  add,

  /** @returns a - b, but clamped to [0, 255] */
  sub,

  /** @returns a * b, but clamped to [0, 255] */
  mul,

  /** @returns ⌊a / b⌋, but clamped to [0, 255] */
  div,
} as const;
