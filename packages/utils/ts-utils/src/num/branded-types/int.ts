/** return type */
type T = Int;

/** non-negative type */
type Abs = Uint;

/** denominator type */
type D = NonZeroInt;

export const toInt = (a: number): T => {
  if (!Number.isInteger(a)) {
    throw new TypeError(`Expected integer, got: ${a}`);
  }
  return a;
};

const to = toInt;

const abs = (x: T): Abs => to(Math.abs(x)) as Abs;

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

export const Int = {
  abs,
  max,
  min,
  random,

  /** @returns a ** b */
  pow,

  /** @returns a + b */
  add,

  /** @returns a - b */
  sub,

  /** @returns a * b */
  mul,

  /** @returns ⌊a / b⌋ */
  div,
} as const;
