import { Num } from '../num.mjs';
import { castType, type ToNonZeroIntWithSmallInt } from './utils.mjs';

type ElementType = Uint16;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const typeName = 'Uint16';

const MIN_VALUE = 0;
const MAX_VALUE = 2 ** 16 - 1;

const isUint16Range = Num.isInRangeInclusive(MIN_VALUE, MAX_VALUE);

export const isUint16 = (a: number): a is ElementType =>
  Number.isInteger(a) && isUint16Range(a);

export const toUint16 = castType<ElementType>(
  isUint16,
  'a non-negative integer less than 2^16',
);

if (import.meta.vitest !== undefined) {
  test(`to${typeName}(1.2) should throw a TypeError`, () => {
    expect(() => toUint16(1.2)).toThrow(
      new TypeError('Expected a non-negative integer less than 2^16, got: 1.2'),
    );
  });
}

const to = toUint16;

const _c = Num.clamp(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): ElementType => to(Math.round(_c(a)));

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
  test(`${typeName}.random`, () => {
    const r = random(0, 5);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(5);
  });
}

export const Uint16 = {
  MIN_VALUE,
  MAX_VALUE,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[0, 2^16)` */
  pow,

  /** @returns `a + b`, but clamped to `[0, 2^16)` */
  add,

  /** @returns `a - b`, but clamped to `[0, 2^16)` */
  sub,

  /** @returns `a * b`, but clamped to `[0, 2^16)` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[0, 2^16)` */
  div,
} as const;
