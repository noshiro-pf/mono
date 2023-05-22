/** return type */
type T = FiniteNumber;

/** arg type */
type A = T;

/** non-negative type */
type Abs = NonNegativeNumber;

/** denominator type */
type D = NonZeroNumber;

export const toFiniteNumber = (a: number): T => {
  if (!Number.isFinite(a)) {
    throw new TypeError(`Expected finite number, got: ${a}`);
  }
  return a;
};

const to = toFiniteNumber;

const abs = (x: A): Abs => Math.abs(x);

const max = (...values: readonly A[]): T => to(Math.max(...values));
const min = (...values: readonly A[]): T => to(Math.min(...values));

const pow = (x: A, y: A): T => to(x ** y);

const add = (x: A, y: A): T => to(x + y);

const sub = (x: A, y: A): T => to(x - y);

const mul = (x: A, y: A): T => to(x * y);

const div = (x: A, y: D): T => to(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: A, max: A): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

const floor = (x: A): T => to(Math.floor(x));
const ceil = (x: A): T => to(Math.ceil(x));
const round = (x: A): T => to(Math.round(x));

export const FiniteNumber = {
  abs,
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
