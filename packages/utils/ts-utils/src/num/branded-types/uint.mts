import { Num } from '../num.mjs';
import { castType, type ToNonZeroIntWithSmallInt } from './utils.mjs';

type ElementType = Uint;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const typeName = 'Uint';

const typeNameInMessage = 'a non-negative integer';

const MIN_VALUE = 0;

export const isUint = (a: number): a is ElementType =>
  Number.isInteger(a) && Num.isNonNegative(a);

export const toUint = castType<ElementType>(isUint, typeNameInMessage);

const to = toUint;

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
    const r = random(0, 5);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(5);
  });
}

export const Uint = {
  MIN_VALUE,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but never less than 0 */
  pow,

  /** @returns `a + b`, but never less than 0 */
  add,

  /** @returns `a - b`, but never less than 0 */
  sub,

  /** @returns `a * b`, but never less than 0 */
  mul,

  /** @returns `⌊a / b⌋`, but never less than 0 */
  div,
} as const;
