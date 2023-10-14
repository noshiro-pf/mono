import { Num } from '../num';

const MIN_VALUE = 1;
const MAX_VALUE = Number.MAX_SAFE_INTEGER;

export const isPositiveSafeInt = (a: number): a is PositiveSafeInt =>
  Number.isSafeInteger(a) && Num.isNonNegative(a) && Num.isNonZero(a);

export const toPositiveSafeInt = (a: number): PositiveSafeInt => {
  if (!isPositiveSafeInt(a)) {
    throw new TypeError(`Expected positive safe integer, got: ${a}`);
  }
  return a;
};

const to = toPositiveSafeInt;

const _c = Num.clamp<number>(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): PositiveSafeInt => to(Math.round(_c(a)));

const _min = (
  ...values: readonly PositiveSafeIntWithSmallInt[]
): PositiveSafeInt => to(Math.min(...values));

const _max = (
  ...values: readonly PositiveSafeIntWithSmallInt[]
): PositiveSafeInt => to(Math.max(...values));

const pow = (
  x: PositiveSafeIntWithSmallInt,
  y: PositiveSafeIntWithSmallInt,
): PositiveSafeInt => clamp(x ** y);

const add = (
  x: PositiveSafeIntWithSmallInt,
  y: PositiveSafeIntWithSmallInt,
): PositiveSafeInt => clamp(x + y);

const sub = (
  x: PositiveSafeIntWithSmallInt,
  y: PositiveSafeIntWithSmallInt,
): PositiveSafeInt => clamp(x - y);

const mul = (
  x: PositiveSafeIntWithSmallInt,
  y: PositiveSafeIntWithSmallInt,
): PositiveSafeInt => clamp(x * y);

const div = (
  x: PositiveSafeIntWithSmallInt,
  y: PositiveSafeIntWithSmallInt,
): PositiveSafeInt => clamp(Math.floor(x / y));

const random = (
  min: PositiveSafeIntWithSmallInt,
  max: PositiveSafeIntWithSmallInt,
): PositiveSafeInt =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const PositiveSafeInt = {
  MIN_VALUE,
  MAX_VALUE,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[1, MAX_SAFE_INTEGER]` */
  pow,

  /** @returns `a + b`, but clamped to `[1, MAX_SAFE_INTEGER]` */
  add,

  /** @returns `a - b`, but clamped to `[1, MAX_SAFE_INTEGER]` */
  sub,

  /** @returns `a * b`, but clamped to `[1, MAX_SAFE_INTEGER]` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[1, MAX_SAFE_INTEGER]` */
  div,
} as const;
