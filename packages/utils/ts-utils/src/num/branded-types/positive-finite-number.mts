import { expectType } from '../../expect-type.mjs';
import { castType, type ToInt } from './utils.mjs';

type ElementType = PositiveFiniteNumber;

const typeName = 'PositiveFiniteNumber';

const typeNameInMessage = 'a positive finite number';

const MIN_VALUE = Number.MIN_VALUE;

export const isPositiveFiniteNumber = (a: number): a is PositiveFiniteNumber =>
  Number.isFinite(a) && a > 0;

const is = isPositiveFiniteNumber;

export const toPositiveFiniteNumber = castType<PositiveFiniteNumber>(
  is,
  typeNameInMessage,
);

const to = toPositiveFiniteNumber;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
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

const div = (x: ElementType, y: ElementType): ElementType => clamp(x / y);

const random = (min: ElementType, max: ElementType): ElementType =>
  add(min, to((Math.max(max, min) - min + 1) * Math.random()));

if (import.meta.vitest !== undefined) {
  test(`${typeName}.random() should throw a TypeError`, () => {
    const min = 2.3;
    const max = 4.5;

    const result = random(to(min), to(max));
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });
}

const floor = (x: ElementType): Uint => Math.floor(x);
const ceil = (x: ElementType): ToInt<ElementType> => Math.ceil(x);
const round = (x: ElementType): Uint => Math.round(x);

if (import.meta.vitest !== undefined) {
  expectType<ToInt<ElementType>, PositiveInt>('=');
}

export const PositiveFiniteNumber = {
  min: _min,
  max: _max,

  floor,
  ceil,
  round,
  random,

  /** @returns `a ** b`, but greater than 0 */
  pow,

  /** @returns `a + b`, but greater than 0 */
  add,

  /** @returns `a - b`, but greater than 0 */
  sub,

  /** @returns `a * b`, but greater than 0 */
  mul,

  /** @returns `a / b`, but greater than 0 */
  div,
} as const;
