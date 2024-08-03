import { toFiniteNumber } from './finite-number.mjs';
import {
  castType,
  type ToNonNegative,
  type ToNonZeroIntWithSmallInt,
} from './utils.mjs';

type ElementType = Int;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

export const toInt = castType<ElementType>(Number.isInteger, 'an integer');

if (import.meta.vitest !== undefined) {
  test('toInt(1.2) should throw a TypeError', () => {
    expect(() => toInt(1.2)).toThrow(
      new TypeError('Expected an integer, got: 1.2'),
    );
  });
}

const to = toInt;

const abs = (x: ElementTypeWithSmallInt): ToNonNegative<ElementType> =>
  Math.abs(to(x));

const _min = (...values: readonly ElementTypeWithSmallInt[]): ElementType =>
  to(Math.min(...values));

const _max = (...values: readonly ElementTypeWithSmallInt[]): ElementType =>
  to(Math.max(...values));

const pow = (
  x: ElementTypeWithSmallInt,
  y: ElementTypeWithSmallInt,
): ElementType => to(x ** y);

const add = (
  x: ElementTypeWithSmallInt,
  y: ElementTypeWithSmallInt,
): ElementType => to(x + y);

const sub = (
  x: ElementTypeWithSmallInt,
  y: ElementTypeWithSmallInt,
): ElementType => to(x - y);

const mul = (
  x: ElementTypeWithSmallInt,
  y: ElementTypeWithSmallInt,
): ElementType => to(x * y);

const div = (
  x: ElementTypeWithSmallInt,
  y: ToNonZeroIntWithSmallInt<ElementType>,
): ElementType => Math.floor(toFiniteNumber(x / y));

const random = (
  min: ElementTypeWithSmallInt,
  max: ElementTypeWithSmallInt,
): ElementType =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

if (import.meta.vitest !== undefined) {
  test('Int.random', () => {
    const r = random(-5, 5);
    expect(r).toBeGreaterThanOrEqual(-5);
    expect(r).toBeLessThanOrEqual(5);
  });
}

export const Int = {
  abs,

  min: _min,
  max: _max,

  random,

  /** @returns `a ** b` */
  pow,

  /** @returns `a + b` */
  add,

  /** @returns `a - b` */
  sub,

  /** @returns `a * b` */
  mul,

  /** @returns `⌊a / b⌋` */
  div,
} as const;
