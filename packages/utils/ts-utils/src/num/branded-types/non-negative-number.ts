import { expectType } from '../../expect-type';

/** return type */
type T = NonNegativeNumber;

/** denominator type */
type D = IntersectBrand<T, NonZeroNumber>;

expectType<D, Brand<number, 'NonNegative', 'NaN' | 'Zero'>>('=');

export const isNonNegative = (a: number): a is T => a >= 0;

export const toNonNegativeNumber = (a: number): T => {
  if (!isNonNegative(a)) {
    throw new TypeError(`Expected non-negative number, got: ${a}`);
  }
  return a;
};

const to = toNonNegativeNumber;

const max = (...values: readonly T[]): T => to(Math.max(...values));
const min = (...values: readonly T[]): T => to(Math.min(...values));

const pow = (x: T, y: T): T => to(x ** y);

const add = (x: T, y: T): T => to(x + y);

/** @returns a - b, but never less than 0 */
const sub = (x: T, y: T): T => to(Math.max(0, x - y));

const mul = (x: T, y: T): T => to(x * y);

const div = (x: T, y: D): T => to(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: T, max: T): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

const floor = (x: T): T => to(Math.floor(x));
const ceil = (x: T): T => to(Math.ceil(x));
const round = (x: T): T => to(Math.round(x));

export const NonNegativeNumber = {
  max,
  min,
  pow,
  add,
  sub,
  mul,
  div,
  random,
  floor,
  ceil,
  round,
} as const;
