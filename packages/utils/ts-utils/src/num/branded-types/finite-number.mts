import { expectType } from '../../expect-type.mjs';
import {
  castType,
  type ToInt,
  type ToNonNegative,
  type ToNonZero,
} from './utils.mjs';

type ElementType = FiniteNumber;

const typeName = 'FiniteNumber';

export const toFiniteNumber = castType<ElementType>(
  Number.isFinite,
  'a finite number',
);

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => toFiniteNumber(value)).toThrow(
      new TypeError(`Expected a finite number, got: ${value}`),
    );
  });
}

const to = toFiniteNumber;

const abs = (x: ElementType): ToNonNegative<ElementType> => Math.abs(x);

if (import.meta.vitest !== undefined) {
  expectType<ToNonNegative<ElementType>, NonNegativeFiniteNumber>('=');
}

const _min = (...values: readonly ElementType[]): ElementType =>
  to(Math.min(...values));

const _max = (...values: readonly ElementType[]): ElementType =>
  to(Math.max(...values));

const pow = (x: ElementType, y: ElementType): ElementType => to(x ** y);

const add = (x: ElementType, y: ElementType): ElementType => to(x + y);

const sub = (x: ElementType, y: ElementType): ElementType => to(x - y);

const mul = (x: ElementType, y: ElementType): ElementType => to(x * y);

const div = (x: ElementType, y: ToNonZero<ElementType>): ElementType =>
  to(Math.floor(x / y));

const random = (min: ElementType, max: ElementType): ElementType =>
  add(min, to((Math.max(max, min) - min + 1) * Math.random()));

if (import.meta.vitest !== undefined) {
  test(`${typeName}.random() should throw a TypeError`, () => {
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
  expectType<ToInt<ElementType>, Int>('=');
}

export const FiniteNumber = {
  abs,

  min: _min,
  max: _max,

  floor,
  ceil,
  round,
  random,

  /** @returns `a ** b` */
  pow,

  /** @returns `a + b` */
  add,

  /** @returns `a - b` */
  sub,

  /** @returns `a * b` */
  mul,

  /** @returns `a / b` */
  div,
} as const;
