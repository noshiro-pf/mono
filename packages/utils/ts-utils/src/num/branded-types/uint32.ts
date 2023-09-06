import { expectType } from '../../expect-type';
import { Num } from '../num';

/** return type */
type T = Uint32;

/** denominator type */
type D = Exclude<SmallUint, 0> | IntersectBrand<Uint32Brand, NonZeroNumber>;

expectType<
  D,
  | Brand<
      number,
      'Finite' | 'Int' | 'NonNegative' | 'SafeInt' | 'Uint32',
      'NaN' | 'Zero'
    >
  | Exclude<SmallUint, 0>
>('=');

const MIN_VALUE = 0;
const MAX_VALUE = 2 ** 32 - 1;

const isUint32Range = Num.isInRangeInclusive(MIN_VALUE, MAX_VALUE);

export const isUint32 = (a: number): a is T =>
  Number.isInteger(a) && isUint32Range(a);

export const toUint32 = (a: number): T => {
  if (!isUint32(a)) {
    throw new TypeError(
      `Expected non-negative integer less than 2^32, got: ${a}`
    );
  }
  return a;
};

const to = toUint32;

const _c = Num.clamp(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): T => to(Math.round(_c(a)));

const max = (...values: readonly T[]): T => to(Math.max(...values));
const min = (...values: readonly T[]): T => to(Math.min(...values));

/** @returns a ** b, but clamped to [0, 2^32) */
const pow = (x: T, y: T): T => clamp(x ** y);

/** @returns a + b, but clamped to [0, 2^32) */
const add = (x: T, y: T): T => clamp(x + y);

/** @returns a - b, but clamped to [0, 2^32) */
const sub = (x: T, y: T): T => clamp(x - y);

/** @returns a * b, but clamped to [0, 2^32) */
const mul = (x: T, y: T): T => clamp(x * y);

/** @returns a / b, but clamped to [0, 2^32) */
const div = (x: T, y: D): T => clamp(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: T, max: T): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Uint32 = {
  MIN_VALUE,
  MAX_VALUE,
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
