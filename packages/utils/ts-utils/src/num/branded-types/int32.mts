import { Num } from '../num.mjs';
import {
  castType,
  type ToNonNegative,
  type ToNonZeroIntWithSmallInt,
} from './utils.mjs';

type ElementType = Int32;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const MIN_VALUE = -(2 ** 31);
const MAX_VALUE = 2 ** 31 - 1;

const isInt32Range = Num.isInRangeInclusive(MIN_VALUE, MAX_VALUE);

export const isInt32 = (a: number): a is ElementType =>
  Number.isInteger(a) && isInt32Range(a);

export const toInt32 = castType<ElementType>(
  isInt32,
  'an integer in [-2^31, 2^31)',
);

if (import.meta.vitest !== undefined) {
  test('toInt32(1.2) should throw a TypeError', () => {
    expect(() => toInt32(1.2)).toThrow(
      new TypeError('Expected an integer in [-2^31, 2^31), got: 1.2'),
    );
  });
}

const to = toInt32;

const _c = Num.clamp(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): ElementType => to(Math.round(_c(a)));

const abs = (x: ElementTypeWithSmallInt): ToNonNegative<ElementType> =>
  Math.abs(to(x));

const _min = (...values: readonly ElementTypeWithSmallInt[]): ElementType =>
  to(Math.min(...values));

const _max = (...values: readonly ElementTypeWithSmallInt[]): ElementType =>
  to(Math.max(...values));

const pow = (
  x: ElementTypeWithSmallInt,
  y: ElementTypeWithSmallInt,
): ElementType => clamp(x ** y);

const add = (
  x: ElementTypeWithSmallInt,
  y: ElementTypeWithSmallInt,
): ElementType => clamp(x + y);

const sub = (
  x: ElementTypeWithSmallInt,
  y: ElementTypeWithSmallInt,
): ElementType => clamp(x - y);

const mul = (
  x: ElementTypeWithSmallInt,
  y: ElementTypeWithSmallInt,
): ElementType => clamp(x * y);

const div = (
  x: ElementTypeWithSmallInt,
  y: ToNonZeroIntWithSmallInt<ElementType>,
): ElementType => clamp(Math.floor(x / y));

const random = (
  min: ElementTypeWithSmallInt,
  max: ElementTypeWithSmallInt,
): ElementType =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

if (import.meta.vitest !== undefined) {
  test('Int32.random', () => {
    const r = random(-5, 5);
    expect(r).toBeGreaterThanOrEqual(-5);
    expect(r).toBeLessThanOrEqual(5);
  });
}

export const Int32 = {
  MIN_VALUE,
  MAX_VALUE,
  abs,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[-2^31, 2^31)` */
  pow,

  /** @returns `a + b`, but clamped to `[-2^31, 2^31)` */
  add,

  /** @returns `a - b`, but clamped to `[-2^31, 2^31)` */
  sub,

  /** @returns `a * b`, but clamped to `[-2^31, 2^31)` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[-2^31, 2^31)` */
  div,
} as const;
