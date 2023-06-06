import { Num } from '../num';

/** return type */
type T = Int8;

/** arg type */
type A = T;

/** non-negative type */
type Abs = Exclude<Int8, NegativeIndex<128>>;

/** denominator type */
type D = Exclude<Int8, 0>;

const MIN_VALUE = -128;
const MAX_VALUE = 127;

const isInInt8Range = Num.isInRange(MIN_VALUE, MAX_VALUE);

export const toInt8 = (a: number): Int8 => {
  if (!Number.isInteger(a) || !isInInt8Range(a)) {
    throw new TypeError(
      `Expected integer in [${MIN_VALUE}, ${MAX_VALUE}], got: ${a}`
    );
  }
  return a as Int8;
};

const to = toInt8;

const _c = Num.clamp<number>(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): T => to(Math.round(_c(a)));

const abs = (x: A): Abs => to(Math.abs(x)) as Abs;

const max = (...values: readonly A[]): T => to(Math.max(...values));
const min = (...values: readonly A[]): T => to(Math.min(...values));

/** @returns a ** b, but clamped to [-128, 127] */
const pow = (x: A, y: A): T => clamp(x ** y);

/** @returns a + b, but clamped to [-128, 127] */
const add = (x: A, y: A): T => clamp(x + y);

/** @returns a - b, but clamped to [-128, 127] */
const sub = (x: A, y: A): T => clamp(x - y);

/** @returns a * b, but clamped to [-128, 127] */
const mul = (x: A, y: A): T => clamp(x * y);

/** @returns a / b, but clamped to [-128, 127] */
const div = (x: A, y: D): T => clamp(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: A, max: A): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Int8 = {
  MIN_VALUE,
  MAX_VALUE,
  max,
  min,
  abs,
  pow,
  add,
  sub,
  mul,
  div,
  random,
  clamp,
} as const;
