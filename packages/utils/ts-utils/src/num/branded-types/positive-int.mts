import { Num } from '../num.mjs';
import { castType, type ToNonZeroIntWithSmallInt } from './utils.mjs';

type ElementType = PositiveInt;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const typeName = 'PositiveInt';

const MIN_VALUE = 1;

export const isPositiveInt = (a: number): a is ElementType =>
  Number.isInteger(a) && Num.isNonNegative(a) && Num.isNonZero(a);

export const toPositiveInt = castType<ElementType>(
  isPositiveInt,
  'a positive integer',
);

if (import.meta.vitest !== undefined) {
  test(`to${typeName}(-1) should throw a TypeError`, () => {
    expect(toPositiveInt(-1)).throws(
      new TypeError('Expected a positive integer, got: -1'),
    );
  });
}

const to = toPositiveInt;

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
} as const;
