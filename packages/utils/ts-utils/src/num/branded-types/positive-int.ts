import { Num } from '../num';

const MIN_VALUE = 1;

export const isPositiveInt = (a: number): a is PositiveInt =>
  Number.isInteger(a) && Num.isNonNegative(a) && Num.isNonZero(a);

export const toPositiveInt = (a: number): PositiveInt => {
  if (!isPositiveInt(a)) {
    throw new TypeError(`Expected positive integer, got: ${a}`);
  }
  return a;
};

const to = toPositiveInt;

const clamp = (a: number): PositiveInt =>
  to(Math.round(Math.max(MIN_VALUE, a)));

const _min = (...values: readonly PositiveIntWithSmallInt[]): PositiveInt =>
  to(Math.min(...values));

const _max = (...values: readonly PositiveIntWithSmallInt[]): PositiveInt =>
  to(Math.max(...values));

const pow = (
  x: PositiveIntWithSmallInt,
  y: PositiveIntWithSmallInt
): PositiveInt => clamp(x ** y);

const add = (
  x: PositiveIntWithSmallInt,
  y: PositiveIntWithSmallInt
): PositiveInt => clamp(x + y);

const sub = (
  x: PositiveIntWithSmallInt,
  y: PositiveIntWithSmallInt
): PositiveInt => clamp(x - y);

const mul = (
  x: PositiveIntWithSmallInt,
  y: PositiveIntWithSmallInt
): PositiveInt => clamp(x * y);

const div = (
  x: PositiveIntWithSmallInt,
  y: PositiveIntWithSmallInt
): PositiveInt => clamp(Math.floor(x / y));

const random = (
  min: PositiveIntWithSmallInt,
  max: PositiveIntWithSmallInt
): PositiveInt =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const PositiveInt = {
  MIN_VALUE,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but never less than 1 */
  pow,

  /** @returns `a + b`, but never less than 1 */
  add,

  /** @returns `a - b`, but never less than 1 */
  sub,

  /** @returns `a * b`, but never less than 1 */
  mul,

  /** @returns `⌊a / b⌋`, but never less than 1 */
  div,
} as const;
