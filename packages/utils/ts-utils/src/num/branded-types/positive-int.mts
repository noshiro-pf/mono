import { Num } from '../num.mjs';
import {
  castType,
  type NumberClass,
  type ToNonZeroIntWithSmallInt,
} from './utils.mjs';

type ElementType = PositiveInt;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const typeName = 'PositiveInt';

const typeNameInMessage = 'a positive integer';

const MIN_VALUE = 1;

export const isPositiveInt = (a: number): a is ElementType =>
  Number.isInteger(a) && Num.isNonNegative(a) && Num.isNonZero(a);

export const toPositiveInt = castType<ElementType>(
  isPositiveInt,
  typeNameInMessage,
);

const to = toPositiveInt;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: '1.2', value: 1.2 },
    { name: '-3.4', value: -3.4 },
    { name: '0', value: 0 },
    { name: '-1', value: -1 },
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => to(value)).toThrow(
      new TypeError(`Expected ${typeNameInMessage}, got: ${value}`),
    );
  });
}

const clamp = (a: number): ElementType =>
  to(Math.round(Math.max(MIN_VALUE, a)));

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
    const r = random(1, 5);
    expect(r).toBeGreaterThanOrEqual(1);
    expect(r).toBeLessThanOrEqual(5);
  });
}

export const PositiveInt = {
  MIN_VALUE,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but never less than 1 */
  pow,

  /** @returns `a + b`, but never less than 1 */
  add,

  /** @returns `a - b`, but never less than 1 */
  sub,

  /** @returns `a * b`, but never less than 1 */
  mul,

  /** @returns `⌊a / b⌋`, but never less than 1 */
  div,
} as const satisfies NumberClass<ElementType, 'int' | 'positive'>;
