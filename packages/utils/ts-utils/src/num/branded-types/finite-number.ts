export const toFiniteNumber = (a: number): FiniteNumber => {
  if (!Number.isFinite(a)) {
    throw new TypeError(`Expected finite number, got: ${a}`);
  }
  return a;
};

const to = toFiniteNumber;

const abs = (x: FiniteNumber): NonNegativeFiniteNumber => Math.abs(x);

const _min = (...values: readonly FiniteNumber[]): FiniteNumber =>
  to(Math.min(...values));

const _max = (...values: readonly FiniteNumber[]): FiniteNumber =>
  to(Math.max(...values));

const pow = (x: FiniteNumber, y: FiniteNumber): FiniteNumber => to(x ** y);

const add = (x: FiniteNumber, y: FiniteNumber): FiniteNumber => to(x + y);

const sub = (x: FiniteNumber, y: FiniteNumber): FiniteNumber => to(x - y);

const mul = (x: FiniteNumber, y: FiniteNumber): FiniteNumber => to(x * y);

const div = (x: FiniteNumber, y: NonZeroFiniteNumber): FiniteNumber =>
  Math.floor(toFiniteNumber(x / y));

const random = (min: FiniteNumber, max: FiniteNumber): FiniteNumber =>
  add(
    min,
    Math.floor(toFiniteNumber((Math.max(max, min) - min + 1) * Math.random()))
  );

const floor = (x: FiniteNumber): Int => Math.floor(x);
const ceil = (x: FiniteNumber): Int => Math.ceil(x);
const round = (x: FiniteNumber): Int => Math.round(x);

export const FiniteNumber = {
  abs,

  min: _min,
  max: _max,

  floor,
  ceil,
  round,
  random,

  /** @returns `a ** b` */
  pow,

  /** @returns `a + b` */
  add,

  /** @returns `a - b` */
  sub,

  /** @returns `a * b` */
  mul,

  /** @returns `a / b` */
  div,
} as const;
