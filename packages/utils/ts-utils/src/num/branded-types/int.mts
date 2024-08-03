import { toFiniteNumber } from './finite-number.mjs';
import {
  castType,
  type ToNonNegative,
  type ToNonZeroIntWithSmallInt,
} from './utils.mjs';

type ElementType = Int;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const typeName = 'Int';

const typeNameInMessage = 'an integer';

const is = Number.isInteger;

export const toInt = castType<ElementType>(is, typeNameInMessage);

const to = toInt;

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
  test(`${typeName}.random`, () => {
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
