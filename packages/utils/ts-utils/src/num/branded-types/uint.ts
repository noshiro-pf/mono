import { expectType } from '../../expect-type';
import { Num } from '../num';

/** return type */
type T = Uint;

/** denominator type */
type D = Exclude<SmallUint, 0> | IntersectBrand<UintBrand, NonZeroNumber>;

expectType<
  D,
  | Brand<number, 'Finite' | 'Int' | 'NonNegative', 'NaN' | 'Zero'>
  | Exclude<SmallUint, 0>
>('=');

export const isUint = (a: number): a is T =>
  Number.isInteger(a) && Num.isNonNegative(a);

export const toUint = (a: number): T => {
  if (!isUint(a)) {
    throw new TypeError(`Expected non-negative integer, got: ${a}`);
  }
  return a;
};

const to = toUint;

const max = (...values: readonly T[]): T => to(Math.max(...values));
const min = (...values: readonly T[]): T => to(Math.min(...values));

const pow = (x: T, y: T): T => to(x ** y);

const add = (x: T, y: T): T => to(x + y);

const sub = (x: T, y: T): T => to(Math.max(0, x - y));

const mul = (x: T, y: T): T => to(x * y);

const div = (x: T, y: D): T => to(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: T, max: T): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

export const Uint = {
  max,
  min,
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
