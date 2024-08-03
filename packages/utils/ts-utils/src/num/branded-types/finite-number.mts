import { expectType } from '../../expect-type.mjs';
import { castType, type ToInt } from './utils.mjs';

type ElementType = FiniteNumber;

export const toFiniteNumber = castType<ElementType>(
  Number.isFinite,
  'a finite number',
);

if (import.meta.vitest !== undefined) {
  test('toFiniteNumber(Number.POSITIVE_INFINITY) should throw a TypeError', () => {
    const value = Number.POSITIVE_INFINITY;
    expect(() => toFiniteNumber(value)).toThrow(
      new TypeError(`Expected a finite number, got: ${value}`),
    );
  });
}

const to = toFiniteNumber;

const abs = (x: ElementType): NonNegativeFiniteNumber => Math.abs(x);

const _min = (...values: readonly ElementType[]): ElementType =>
  to(Math.min(...values));

const _max = (...values: readonly ElementType[]): ElementType =>
  to(Math.max(...values));

const pow = (x: ElementType, y: ElementType): ElementType => to(x ** y);

const add = (x: ElementType, y: ElementType): ElementType => to(x + y);

const sub = (x: ElementType, y: ElementType): ElementType => to(x - y);

const mul = (x: ElementType, y: ElementType): ElementType => to(x * y);

const div = (x: ElementType, y: NonZeroFiniteNumber): ElementType =>
  to(Math.floor(x / y));

const random = (min: ElementType, max: ElementType): ElementType =>
  add(min, to((Math.max(max, min) - min + 1) * Math.random()));

if (import.meta.vitest !== undefined) {
  test('FiniteNumber.random() should throw a TypeError', () => {
    const result = random(to(-2.3), to(4.5));
    expect(result).toBeGreaterThanOrEqual(-2.3);
    expect(result).toBeLessThanOrEqual(4.5);
  });
}

const floor = (x: ElementType): ToInt<ElementType> => Math.floor(x);
const ceil = (x: ElementType): ToInt<ElementType> => Math.ceil(x);
const round = (x: ElementType): ToInt<ElementType> => Math.round(x);

if (import.meta.vitest !== undefined) {
  expectType<ToInt<ElementType>, Int>('=');
}

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
