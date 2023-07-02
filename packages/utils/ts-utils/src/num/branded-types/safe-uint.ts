import { expectType } from '../../expect-type';
import { Num } from '../num';

/** return type */
type T = SafeUint;

/** denominator type */
type D = Exclude<SmallUint, 0> | IntersectBrand<SafeUintBrand, NonZeroNumber>;

expectType<
  D,
  | Brand<number, 'Finite' | 'Int' | 'NonNegative' | 'SafeInt', 'NaN' | 'Zero'>
  | Exclude<SmallUint, 0>
>('=');

const MIN_VALUE = 0;
const MAX_VALUE = Number.MAX_SAFE_INTEGER;

export const isSafeUint = (a: number): a is T =>
  Number.isSafeInteger(a) && Num.isNonNegative(a);

export const toSafeUint = (a: number): T => {
  if (!isSafeUint(a)) {
    throw new TypeError(`Expected safe non-negative integer, got: ${a}`);
  }
  return a;
};

const to = toSafeUint;

const _c = Num.clamp<number>(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): T => to(Math.round(_c(a)));

const max = (...values: readonly T[]): T => to(Math.max(...values));
const min = (...values: readonly T[]): T => to(Math.min(...values));

const pow = (x: T, y: T): T => clamp(x ** y);

const add = (x: T, y: T): T => clamp(x + y);

const sub = (x: T, y: T): T => clamp(x - y);

const mul = (x: T, y: T): T => clamp(x * y);

const div = (x: T, y: D): T => clamp(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: T, max: T): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const SafeUint = {
  MIN_VALUE,
  MAX_VALUE,
  max,
  min,
  clamp,
  random,

  /** @returns a ** b, but clamped to [0, MAX_SAFE_INTEGER] */
  pow,

  /** @returns a + b, but clamped to [0, MAX_SAFE_INTEGER] */
  add,

  /** @returns a - b, but clamped to [0, MAX_SAFE_INTEGER] */
  sub,

  /** @returns a * b, but clamped to [0, MAX_SAFE_INTEGER] */
  mul,

  /** @returns ⌊a / b⌋, but clamped to [0, MAX_SAFE_INTEGER] */
  div,
} as const;
