import { expectType } from '../../expect-type.mjs';
import { FiniteNumber } from './finite-number.mjs';
import { castType, type NumberClass, type ToInt } from './utils.mjs';

type ElementType = NonNegativeFiniteNumber;

const typeName = 'NonNegativeFiniteNumber';

const typeNameInMessage = 'a non-negative finite number';

const MIN_VALUE = 0;

export const isNonNegativeFiniteNumber = (a: number): a is ElementType =>
  Number.isFinite(a) && a >= 0;

const is = isNonNegativeFiniteNumber;

export const toNonNegativeFiniteNumber = castType<ElementType>(
  is,
  typeNameInMessage,
);

const to = toNonNegativeFiniteNumber;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: '-1.2', value: -1.2 },
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => to(value)).toThrow(
      new TypeError(`Expected ${typeNameInMessage}, got: ${value}`),
    );
  });
}

const clamp = (a: number): ElementType => to(Math.max(MIN_VALUE, a));

const _min = (...values: readonly ElementType[]): ElementType =>
  clamp(Math.min(...values));

const _max = (...values: readonly ElementType[]): ElementType =>
  clamp(Math.max(...values));

const pow = (x: ElementType, y: ElementType): ElementType => clamp(x ** y);

const add = (x: ElementType, y: ElementType): ElementType => clamp(x + y);

const sub = (x: ElementType, y: ElementType): ElementType => clamp(x - y);

const mul = (x: ElementType, y: ElementType): ElementType => clamp(x * y);

const div = (x: ElementType, y: PositiveFiniteNumber): ElementType =>
  clamp(x / y);

const random = (min: ElementType, max: ElementType): ElementType =>
  to(FiniteNumber.random(min, max));

if (import.meta.vitest !== undefined) {
  test(`${typeName}.random`, () => {
    const min = -2.3;
    const max = 4.5;
    const result = random(to(min), to(max));
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });
}

const floor = (x: ElementType): ToInt<ElementType> => Math.floor(x);
const ceil = (x: ElementType): ToInt<ElementType> => Math.ceil(x);
const round = (x: ElementType): ToInt<ElementType> => Math.round(x);

if (import.meta.vitest !== undefined) {
  expectType<ToInt<ElementType>, Uint>('=');
}

export const NonNegativeFiniteNumber = {
  min: _min,
  max: _max,

  floor,
  ceil,
  round,
  random,

  /** @returns `a ** b`, but never less than 0 */
  pow,

  /** @returns `a + b`, but never less than 0 */
  add,

  /** @returns `a - b`, but never less than 0 */
  sub,

  /** @returns `a * b`, but never less than 0 */
  mul,

  /** @returns `a / b`, but never less than 0 */
  div,
} as const satisfies NumberClass<ElementType, 'non-negative'>;
