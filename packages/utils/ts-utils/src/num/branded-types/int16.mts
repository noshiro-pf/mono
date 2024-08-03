import { Num } from '../num.mjs';
import {
  castType,
  type ToNonNegative,
  type ToNonZeroIntWithSmallInt,
} from './utils.mjs';

type ElementType = Int16;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const typeName = 'Int16';

const typeNameInMessage = 'an integer in [-2^15, 2^15)';

const MIN_VALUE = -(2 ** 15);
const MAX_VALUE = 2 ** 15 - 1;

const isInt16Range = Num.isInRangeInclusive(MIN_VALUE, MAX_VALUE);

export const isInt16 = (a: number): a is ElementType =>
  Number.isInteger(a) && isInt16Range(a);

export const toInt16 = castType<ElementType>(isInt16, typeNameInMessage);

const to = toInt16;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: '1.2', value: 1.2 },
    { name: '-3.4', value: -3.4 },
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => to(value)).toThrow(
      new TypeError(`Expected ${typeNameInMessage}, got: ${value}`),
    );
  });
}

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
  test(`${typeName}.random`, () => {
    const r = random(-5, 5);
    expect(r).toBeGreaterThanOrEqual(-5);
    expect(r).toBeLessThanOrEqual(5);
  });
}

export const Int16 = {
  MIN_VALUE,
  MAX_VALUE,
  abs,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[-2^15, 2^15)` */
  pow,

  /** @returns `a + b`, but clamped to `[-2^15, 2^15)` */
  add,

  /** @returns `a - b`, but clamped to `[-2^15, 2^15)` */
  sub,

  /** @returns `a * b`, but clamped to `[-2^15, 2^15)` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[-2^15, 2^15)` */
  div,
} as const;
