import { Num } from '../num.mjs';
import { Int } from './int.mjs';
import {
  castType,
  type NumberClass,
  type ToNonZeroIntWithSmallInt,
} from './utils.mjs';

type ElementType = Uint32;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const typeName = 'Uint32';

const typeNameInMessage = 'a non-negative integer less than 2^32';

const MIN_VALUE = 0;
const MAX_VALUE = 2 ** 32 - 1;

const isUint32Range = Num.isInRangeInclusive(MIN_VALUE, MAX_VALUE);

export const isUint32 = (a: number): a is ElementType =>
  Number.isInteger(a) && isUint32Range(a);

const is = isUint32;

export const toUint32 = castType<ElementType>(is, typeNameInMessage);

const to = toUint32;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: '1.2', value: 1.2 },
    { name: '-3.4', value: -3.4 },
    { name: '-1', value: -1 },
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => to(value)).toThrow(
      new TypeError(`Expected ${typeNameInMessage}, got: ${value}`),
    );
  });
}

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
): ElementType => to(Int.random(min, max));

if (import.meta.vitest !== undefined) {
  test(`${typeName}.random`, () => {
    const min = 0;
    const max = 5;
    const result = random(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });
}

export const Uint32 = {
  MIN_VALUE,
  MAX_VALUE,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[0, 2^32)` */
  pow,

  /** @returns `a + b`, but clamped to `[0, 2^32)` */
  add,

  /** @returns `a - b`, but clamped to `[0, 2^32)` */
  sub,

  /** @returns `a * b`, but clamped to `[0, 2^32)` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[0, 2^32)` */
  div,
} as const satisfies NumberClass<ElementType, 'int' | 'non-negative' | 'range'>;
