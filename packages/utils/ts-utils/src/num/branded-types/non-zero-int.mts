import { Int } from './int.mjs';
import { castType } from './utils.mjs';

type ElementType = NonZeroInt;
type ElementTypeWithSmallInt = NonZeroIntWithSmallInt;

export const isNonZeroInt = (a: number): a is ElementType =>
  Number.isInteger(a) && a !== 0;

export const toNonZeroInt = castType<ElementType>(
  isNonZeroInt,
  'non-zero integer',
);

if (import.meta.vitest !== undefined) {
  test('toNonZeroInt(1.2) should throw a TypeError', () => {
    expect(() => toNonZeroInt(1.2)).toThrow(
      new TypeError('Expected integer, got: 1.2'),
    );
  });
}

const to = toNonZeroInt;

const abs = (x: ElementTypeWithSmallInt): PositiveInt =>
  Math.abs(toNonZeroInt(x));

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
  y: NonZeroIntWithSmallInt,
): ElementType => Math.floor(to(x / y));

const random = (
  min: ElementTypeWithSmallInt,
  max: ElementTypeWithSmallInt,
): ElementType => {
  let mut_r = 0;
  while (mut_r === 0) {
    mut_r = Int.random(min, max);
  }
  return to(mut_r);
};

if (import.meta.vitest !== undefined) {
  test('Int.random', () => {
    const r = random(-3, 2);
    expect(r).toBeGreaterThanOrEqual(-3);
    expect(r).toBeLessThanOrEqual(2);
    expect(r).not.toBe(0);
  });
}

export const NonZeroInt = {
  abs,

  min: _min,
  max: _max,

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
