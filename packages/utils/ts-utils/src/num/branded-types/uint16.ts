import { expectType } from '../../expect-type';
import { Num } from '../num';

/** return type */
type T = Uint16;

/** denominator type */
type D = Exclude<SmallUint, 0> | IntersectBrand<Uint16Brand, NonZeroNumber>;

expectType<
  D,
  | Brand<
      number,
      'Finite' | 'Int' | 'NonNegative' | 'SafeInt' | 'Uint16' | 'Uint32',
      'NaN' | 'Zero'
    >
  | Exclude<SmallUint, 0>
>('=');

const MIN_VALUE = 0;
const MAX_VALUE = 2 ** 16 - 1;

const isUint16Range = Num.isInRangeInclusive(MIN_VALUE, MAX_VALUE);

export const isUint16 = (a: number): a is T =>
  Number.isInteger(a) && isUint16Range(a);

export const toUint16 = (a: number): T => {
  if (!isUint16(a)) {
    throw new TypeError(
      `Expected non-negative integer less than 2^16, got: ${a}`
    );
  }
  return a;
};

const to = toUint16;

const _c = Num.clamp(MIN_VALUE, MAX_VALUE);
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

export const Uint16 = {
  MIN_VALUE,
  MAX_VALUE,
  max,
  min,
  clamp,
  random,

  /** @returns a ** b, but clamped to [0, 2^16) */
  pow,

  /** @returns a + b, but clamped to [0, 2^16) */
  add,

  /** @returns a - b, but clamped to [0, 2^16) */
  sub,

  /** @returns a * b, but clamped to [0, 2^16) */
  mul,

  /** @returns ⌊a / b⌋, but clamped to [0, 2^16) */
  div,
} as const;
