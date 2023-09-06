import { expectType } from '../../expect-type';
import { Num } from '../num';

/** return type */
type T = Int16;

/** non-negative type */
type Abs = IntersectBrand<Int16Brand, NonNegativeNumber> | SmallUint;

/** denominator type */
type D = Exclude<SmallInt, 0> | IntersectBrand<Int16Brand, NonZeroNumber>;

expectType<
  Abs,
  | Brand<
      number,
      'Finite' | 'Int' | 'Int16' | 'Int32' | 'NonNegative' | 'SafeInt',
      'NaN'
    >
  | SmallUint
>('=');

expectType<
  D,
  | Brand<
      number,
      'Finite' | 'Int' | 'Int16' | 'Int32' | 'SafeInt',
      'NaN' | 'Zero'
    >
  | Exclude<SmallInt, 0>
>('=');

const MIN_VALUE = -(2 ** 15);
const MAX_VALUE = 2 ** 15 - 1;

const isInt16Range = Num.isInRangeInclusive(MIN_VALUE, MAX_VALUE);

export const isInt16 = (a: number): a is T =>
  Number.isInteger(a) && isInt16Range(a);

export const toInt16 = (a: number): T => {
  if (!isInt16(a)) {
    throw new TypeError(`Expected integer in [-2^15, 2^15), got: ${a}`);
  }
  return a;
};

const to = toInt16;

const _c = Num.clamp(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): T => to(Math.round(_c(a)));

const abs = (x: T): Abs => to(Math.abs(x)) as Abs;

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

export const Int16 = {
  MIN_VALUE,
  MAX_VALUE,
  abs,
  max,
  min,
  clamp,
  random,

  /** @returns a ** b, but clamped to [-2^15, 2^15) */
  pow,

  /** @returns a + b, but clamped to [-2^15, 2^15) */
  add,

  /** @returns a - b, but clamped to [-2^15, 2^15) */
  sub,

  /** @returns a * b, but clamped to [-2^15, 2^15) */
  mul,

  /** @returns ⌊a / b⌋, but clamped to [-2^15, 2^15) */
  div,
} as const;
