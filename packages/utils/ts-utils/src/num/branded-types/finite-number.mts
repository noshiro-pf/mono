import { castType } from './to-type.mjs';

export const toFiniteNumber = castType<FiniteNumber>(
  Number.isFinite,
  'finite number',
);

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
  to(Math.floor(x / y));

const random = (min: FiniteNumber, max: FiniteNumber): FiniteNumber =>
  add(min, to((Math.max(max, min) - min + 1) * Math.random()));

if (import.meta.vitest !== undefined) {
  test('NonZeroInt.random() should throw a TypeError', () => {
    const result = random(to(-2.3), to(4.5));
    expect(result).toBeGreaterThanOrEqual(-2.3);
    expect(result).toBeLessThanOrEqual(4.5);
  });
}

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
