import { Num } from '../num.mjs';

const MIN_VALUE = 0;

export const isUint = (a: number): a is Uint =>
  Number.isInteger(a) && Num.isNonNegative(a);

export const toUint = (a: number): Uint => {
  if (!isUint(a)) {
    throw new TypeError(`Expected non-negative integer, got: ${a}`);
  }
  return a;
};

const to = toUint;

const clamp = (a: number): Uint => to(Math.round(Math.max(MIN_VALUE, a)));

const _min = (...values: readonly UintWithSmallInt[]): Uint =>
  to(Math.min(...values));

const _max = (...values: readonly UintWithSmallInt[]): Uint =>
  to(Math.max(...values));

const pow = (x: UintWithSmallInt, y: UintWithSmallInt): Uint => clamp(x ** y);

const add = (x: UintWithSmallInt, y: UintWithSmallInt): Uint => clamp(x + y);

const sub = (x: UintWithSmallInt, y: UintWithSmallInt): Uint => clamp(x - y);

const mul = (x: UintWithSmallInt, y: UintWithSmallInt): Uint => clamp(x * y);

const div = (x: UintWithSmallInt, y: PositiveIntWithSmallInt): Uint =>
  clamp(Math.floor(x / y));

const random = (min: UintWithSmallInt, max: UintWithSmallInt): Uint =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Uint = {
  MIN_VALUE,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but never less than 0 */
  pow,

  /** @returns `a + b`, but never less than 0 */
  add,

  /** @returns `a - b`, but never less than 0 */
  sub,

  /** @returns `a * b`, but never less than 0 */
  mul,

  /** @returns `⌊a / b⌋`, but never less than 0 */
  div,
} as const;
