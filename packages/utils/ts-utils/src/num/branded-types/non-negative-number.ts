/** return type */
type T = NonNegativeNumber;

/** arg type */
type A = T;

/** denominator type */
type D = IntersectBrand<T, NonZeroNumber>;

export const isNonNegative = (a: number): a is T => a >= 0;

export const toNonNegativeNumber = (a: number): T => {
  if (!isNonNegative(a)) {
    throw new TypeError(`Expected non-negative number, got: ${a}`);
  }
  return a;
};

const to = toNonNegativeNumber;

const max = (...values: readonly A[]): T => to(Math.max(...values));
const min = (...values: readonly A[]): T => to(Math.min(...values));

const pow = (x: A, y: A): T => to(x ** y);

const add = (x: A, y: A): T => to(x + y);

/** @returns a - b, but never less than 0 */
const sub = (x: A, y: A): T => to(Math.max(0, x - y));

const mul = (x: A, y: A): T => to(x * y);

const div = (x: A, y: D): T => to(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: A, max: A): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

const floor = (x: A): T => to(Math.floor(x));
const ceil = (x: A): T => to(Math.ceil(x));
const round = (x: A): T => to(Math.round(x));

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
