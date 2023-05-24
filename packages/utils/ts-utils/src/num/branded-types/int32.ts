import { expectType } from '../../expect-type';
import { Num } from '../num';

/** return type */
type T = Int32;

/** non-negative type */
type Abs = IntersectBrand<Int32Brand, NonNegativeNumber> | SmallUint;

/** denominator type */
type D = Exclude<SmallInt, 0> | IntersectBrand<Int32Brand, NonZeroNumber>;

expectType<
  Abs,
  | Brand<number, 'Finite' | 'Int' | 'Int32' | 'NonNegative' | 'SafeInt', 'NaN'>
  | SmallUint
>('=');

expectType<
  D,
  | Brand<number, 'Finite' | 'Int' | 'Int32' | 'SafeInt', 'NaN' | 'Zero'>
  | Exclude<SmallInt, 0>
>('=');

const MIN_VALUE = -(2 ** 31);
const MAX_VALUE = 2 ** 31 - 1;

const isInt32Range = Num.isInRange(MIN_VALUE, MAX_VALUE);

export const isInt32 = (a: number): a is T =>
  Number.isInteger(a) && isInt32Range(a);

export const toInt32 = (a: number): T => {
  if (!isInt32(a)) {
    throw new TypeError(`Expected integer in [-2^31, 2^31), got: ${a}`);
  }
  return a;
};

const to = toInt32;

const _c = Num.clamp(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): T => to(Math.round(_c(a)));

const abs = (x: T): Abs => to(Math.abs(x)) as Abs;

const max = (...values: readonly T[]): T => to(Math.max(...values));
const min = (...values: readonly T[]): T => to(Math.min(...values));

/** @returns a ** b, but clamped to [-2^31, 2^31) */
const pow = (x: T, y: T): T => clamp(x ** y);

/** @returns a + b, but clamped to [-2^31, 2^31) */
const add = (x: T, y: T): T => clamp(x + y);

/** @returns a - b, but clamped to [-2^31, 2^31) */
const sub = (x: T, y: T): T => clamp(x - y);

/** @returns a * b, but clamped to [-2^31, 2^31) */
const mul = (x: T, y: T): T => clamp(x * y);

/** @returns a / b, but clamped to [-2^31, 2^31) */
const div = (x: T, y: D): T => clamp(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: T, max: T): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Int32 = {
  MIN_VALUE,
  MAX_VALUE,
  abs,
  max,
  min,
  pow,
  add,
  sub,
  mul,
  div,
  random,
  clamp,
} as const;
