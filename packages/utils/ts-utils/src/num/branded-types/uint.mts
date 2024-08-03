import { Num } from '../num.mjs';
import { castType, type ToNonZeroIntWithSmallInt } from './utils.mjs';

type ElementType = Uint;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const typeName = 'Uint';

const MIN_VALUE = 0;

export const isUint = (a: number): a is ElementType =>
  Number.isInteger(a) && Num.isNonNegative(a);

export const toUint = castType<ElementType>(isUint, 'a non-negative integer');

if (import.meta.vitest !== undefined) {
  test(`to${typeName}(1.2) should throw a TypeError`, () => {
    expect(() => toUint(1.2)).toThrow(
      new TypeError('Expected a non-negative integer, got: 1.2'),
    );
  });
}

const to = toUint;

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
