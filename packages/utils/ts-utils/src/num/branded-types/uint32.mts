import { Num } from '../num.mjs';

const MIN_VALUE = 0;
const MAX_VALUE = 2 ** 32 - 1;

const isUint32Range = Num.isInRangeInclusive(MIN_VALUE, MAX_VALUE);

export const isUint32 = (a: number): a is Uint32 =>
  Number.isInteger(a) && isUint32Range(a);

export const toUint32 = (a: number): Uint32 => {
  if (!isUint32(a)) {
    throw new TypeError(
      `Expected non-negative integer less than 2^32, got: ${a}`,
    );
  }
  return a;
};

const to = toUint32;

const _c = Num.clamp(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): Uint32 => to(Math.round(_c(a)));

const _min = (...values: readonly Uint32WithSmallInt[]): Uint32 =>
  to(Math.min(...values));

const _max = (...values: readonly Uint32WithSmallInt[]): Uint32 =>
  to(Math.max(...values));

const pow = (x: Uint32WithSmallInt, y: Uint32WithSmallInt): Uint32 =>
  clamp(x ** y);

const add = (x: Uint32WithSmallInt, y: Uint32WithSmallInt): Uint32 =>
  clamp(x + y);

const sub = (x: Uint32WithSmallInt, y: Uint32WithSmallInt): Uint32 =>
  clamp(x - y);

const mul = (x: Uint32WithSmallInt, y: Uint32WithSmallInt): Uint32 =>
  clamp(x * y);

const div = (
  x: Uint32WithSmallInt,
  y: WithSmallInt<IntersectBrand<Uint32, NonZeroNumber>>,
): Uint32 => clamp(Math.floor(x / y));

const random = (min: Uint32WithSmallInt, max: Uint32WithSmallInt): Uint32 =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Uint32 = {
  MIN_VALUE,
  MAX_VALUE,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[0, 2^32)` */
  pow,

  /** @returns `a + b`, but clamped to `[0, 2^32)` */
  add,

  /** @returns `a - b`, but clamped to `[0, 2^32)` */
  sub,

  /** @returns `a * b`, but clamped to `[0, 2^32)` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[0, 2^32)` */
  div,
} as const;
