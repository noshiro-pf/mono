import { Num } from '../num';

const MIN_VALUE = 0;
const MAX_VALUE = 2 ** 16 - 1;

const isUint16Range = Num.isInRangeInclusive(MIN_VALUE, MAX_VALUE);

export const isUint16 = (a: number): a is Uint16 =>
  Number.isInteger(a) && isUint16Range(a);

export const toUint16 = (a: number): Uint16 => {
  if (!isUint16(a)) {
    throw new TypeError(
      `Expected non-negative integer less than 2^16, got: ${a}`,
    );
  }
  return a;
};

const to = toUint16;

const _c = Num.clamp(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): Uint16 => to(Math.round(_c(a)));

const _min = (...values: readonly Uint32WithSmallInt[]): Uint16 =>
  to(Math.min(...values));

const _max = (...values: readonly Uint32WithSmallInt[]): Uint16 =>
  to(Math.max(...values));

const pow = (x: Uint32WithSmallInt, y: Uint32WithSmallInt): Uint16 =>
  clamp(x ** y);

const add = (x: Uint32WithSmallInt, y: Uint32WithSmallInt): Uint16 =>
  clamp(x + y);

const sub = (x: Uint32WithSmallInt, y: Uint32WithSmallInt): Uint16 =>
  clamp(x - y);

const mul = (x: Uint32WithSmallInt, y: Uint32WithSmallInt): Uint16 =>
  clamp(x * y);

const div = (
  x: Uint32WithSmallInt,
  y: WithSmallInt<IntersectBrand<Uint16, NonZeroNumber>>,
): Uint16 => clamp(Math.floor(x / y));

const random = (min: Uint32WithSmallInt, max: Uint32WithSmallInt): Uint16 =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Uint16 = {
  MIN_VALUE,
  MAX_VALUE,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[0, 2^16)` */
  pow,

  /** @returns `a + b`, but clamped to `[0, 2^16)` */
  add,

  /** @returns `a - b`, but clamped to `[0, 2^16)` */
  sub,

  /** @returns `a * b`, but clamped to `[0, 2^16)` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[0, 2^16)` */
  div,
} as const;
