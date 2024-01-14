import { Num } from '../num.mjs';
import { toFiniteNumber } from './finite-number.mjs';

const MIN_VALUE = Number.MIN_SAFE_INTEGER;
const MAX_VALUE = Number.MAX_SAFE_INTEGER;

export const toSafeInt = (a: number): SafeInt => {
  if (!Number.isSafeInteger(a)) {
    throw new TypeError(`Expected safe integer, got: ${a}`);
  }
  return a;
};

const to = toSafeInt;

const _c = Num.clamp<number>(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): SafeInt => to(Math.round(_c(a)));

const abs = (x: SafeIntWithSmallInt): SafeUint => Math.abs(to(x));

const _min = (...values: readonly SafeIntWithSmallInt[]): SafeInt =>
  to(Math.min(...values));

const _max = (...values: readonly SafeIntWithSmallInt[]): SafeInt =>
  to(Math.max(...values));

const pow = (x: SafeIntWithSmallInt, y: SafeIntWithSmallInt): SafeInt =>
  clamp(x ** y);

const add = (x: SafeIntWithSmallInt, y: SafeIntWithSmallInt): SafeInt =>
  clamp(x + y);

const sub = (x: SafeIntWithSmallInt, y: SafeIntWithSmallInt): SafeInt =>
  clamp(x - y);

const mul = (x: SafeIntWithSmallInt, y: SafeIntWithSmallInt): SafeInt =>
  clamp(x * y);

const div = (x: SafeIntWithSmallInt, y: NonZeroSafeIntWithSmallInt): SafeInt =>
  clamp(Math.floor(toFiniteNumber(x / y)));

const random = (min: SafeIntWithSmallInt, max: SafeIntWithSmallInt): SafeInt =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const SafeInt = {
  MIN_VALUE,
  MAX_VALUE,
  abs,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[MIN_SAFE_INTEGER, MAX_SAFE_INTEGER]` */
  pow,

  /** @returns `a + b`, but clamped to `[MIN_SAFE_INTEGER, MAX_SAFE_INTEGER]` */
  add,

  /** @returns `a - b`, but clamped to `[MIN_SAFE_INTEGER, MAX_SAFE_INTEGER]` */
  sub,

  /** @returns `a * b`, but clamped to `[MIN_SAFE_INTEGER, MAX_SAFE_INTEGER]` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[MIN_SAFE_INTEGER, MAX_SAFE_INTEGER]` */
  div,
} as const;
