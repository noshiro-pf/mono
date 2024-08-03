import { Int } from './int.mjs';
import {
  castType,
  type NumberClass,
  type ToNonNegative,
  type ToNonZeroIntWithSmallInt,
} from './utils.mjs';

type ElementType = NonZeroInt;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const typeName = 'NonZeroInt';

const typeNameInMessage = 'a non-zero integer';

export const isNonZeroInt = (a: number): a is ElementType =>
  Number.isInteger(a) && a !== 0;

const is = isNonZeroInt;

export const toNonZeroInt = castType<ElementType>(is, typeNameInMessage);

const to = toNonZeroInt;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: '1.2', value: 1.2 },
    { name: '-3.4', value: -3.4 },
    { name: '0', value: 0 },
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => to(value)).toThrow(
      new TypeError(`Expected ${typeNameInMessage}, got: ${value}`),
    );
  });
}

const abs = (x: ElementTypeWithSmallInt): ToNonNegative<ElementType> =>
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
  y: ToNonZeroIntWithSmallInt<ElementType>,
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
  test(`${typeName}.random`, () => {
    const min = -5;
    const max = 5;
    const result = random(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
    expect(result).not.toBe(0);
  });
}

export const NonZeroInt = {
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
} as const satisfies NumberClass<ElementType, 'int'>;
