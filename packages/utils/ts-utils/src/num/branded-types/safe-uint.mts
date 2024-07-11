import { Num } from '../num.mjs';
import { castType } from './to-type.mjs';

const MIN_VALUE = 0;
const MAX_VALUE = Number.MAX_SAFE_INTEGER;

export const isSafeUint = (a: number): a is SafeUint =>
  Number.isSafeInteger(a) && Num.isNonNegative(a);

export const toSafeUint = castType<SafeUint>(
  isSafeUint,
  'non-negative safe integer',
);

const to = toSafeUint;

const _c = Num.clamp<number>(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): SafeUint => to(Math.round(_c(a)));

const _min = (...values: readonly SafeUintWithSmallInt[]): SafeUint =>
  to(Math.min(...values));

const _max = (...values: readonly SafeUintWithSmallInt[]): SafeUint =>
  to(Math.max(...values));

const pow = (x: SafeUintWithSmallInt, y: SafeUintWithSmallInt): SafeUint =>
  clamp(x ** y);

const add = (x: SafeUintWithSmallInt, y: SafeUintWithSmallInt): SafeUint =>
  clamp(x + y);

const sub = (x: SafeUintWithSmallInt, y: SafeUintWithSmallInt): SafeUint =>
  clamp(x - y);

const mul = (x: SafeUintWithSmallInt, y: SafeUintWithSmallInt): SafeUint =>
  clamp(x * y);

const div = (
  x: SafeUintWithSmallInt,
  y: PositiveSafeIntWithSmallInt,
): SafeUint => clamp(Math.floor(x / y));

const random = (
  min: SafeUintWithSmallInt,
  max: SafeUintWithSmallInt,
): SafeUint =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const SafeUint = {
  MIN_VALUE,
  MAX_VALUE,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[0, MAX_SAFE_INTEGER]` */
  pow,

  /** @returns `a + b`, but clamped to `[0, MAX_SAFE_INTEGER]` */
  add,

  /** @returns `a - b`, but clamped to `[0, MAX_SAFE_INTEGER]` */
  sub,

  /** @returns `a * b`, but clamped to `[0, MAX_SAFE_INTEGER]` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[0, MAX_SAFE_INTEGER]` */
  div,
} as const;
