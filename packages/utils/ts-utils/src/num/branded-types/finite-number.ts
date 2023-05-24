/** return type */
type T = FiniteNumber;

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

const abs = (x: T): Abs => Math.abs(x);

const max = (...values: readonly T[]): T => to(Math.max(...values));
const min = (...values: readonly T[]): T => to(Math.min(...values));

const pow = (x: T, y: T): T => to(x ** y);

const add = (x: T, y: T): T => to(x + y);

const sub = (x: T, y: T): T => to(x - y);

const mul = (x: T, y: T): T => to(x * y);

const div = (x: T, y: D): T => to(Math.floor(x / y));

// eslint-disable-next-line @typescript-eslint/no-shadow
const random = (min: T, max: T): T =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

const floor = (x: T): T => to(Math.floor(x));
const ceil = (x: T): T => to(Math.ceil(x));
const round = (x: T): T => to(Math.round(x));

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
