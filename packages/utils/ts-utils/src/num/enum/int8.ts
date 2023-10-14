import { Num } from '../num';

const MIN_VALUE = -128;
const MAX_VALUE = 127;

const _r = Num.isInRangeInclusive(MIN_VALUE, MAX_VALUE);
const isInInt8Range = (a: number): a is Int8 => Number.isInteger(a) && _r(a);

export const toInt8 = (a: number): Int8 => {
  if (!isInInt8Range(a)) {
    throw new TypeError(
      `Expected integer in [${MIN_VALUE}, ${MAX_VALUE}], got: ${a}`,
    );
  }
  return a;
};

const to = toInt8;

const _c = Num.clamp<number>(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): Int8 => to(Math.round(_c(a)));

type Abs = Index<129>;

const abs = (x: Int8): Abs => Math.abs(x);

const _min = (...values: readonly Int8[]): Int8 => to(Math.min(...values));

const _max = (...values: readonly Int8[]): Int8 => to(Math.max(...values));

const pow = (x: Int8, y: Int8): Int8 => clamp(x ** y);

const add = (x: Int8, y: Int8): Int8 => clamp(x + y);

const sub = (x: Int8, y: Int8): Int8 => clamp(x - y);

const mul = (x: Int8, y: Int8): Int8 => clamp(x * y);

const div = (x: Int8, y: Exclude<Int8, 0>): Int8 => clamp(Math.floor(x / y));

const random = (min: Int8, max: Int8): Int8 =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Int8 = {
  MIN_VALUE,
  MAX_VALUE,

  min: _min,
  max: _max,
  clamp,

  abs,
  random,

  /** @returns a ** b, but clamped to [-128, 127] */
  pow,

  /** @returns a + b, but clamped to [-128, 127] */
  add,

  /** @returns a - b, but clamped to [-128, 127] */
  sub,

  /** @returns a * b, but clamped to [-128, 127] */
  mul,

  /** @returns ⌊a / b⌋, but clamped to [-128, 127] */
  div,
} as const;
