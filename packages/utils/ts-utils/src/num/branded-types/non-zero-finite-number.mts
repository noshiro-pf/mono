import { expectType } from '../../expect-type.mjs';
import {
  castType,
  type NumberClass,
  type RemoveNonZeroKey,
  type ToInt,
  type ToNonNegative,
  type ToNonZero,
} from './utils.mjs';

type ElementType = NonZeroFiniteNumber;

const typeName = 'NonZeroFiniteNumber';

const typeNameInMessage = 'a non-zero finite number';

export const isNonZeroFiniteNumber = (a: number): a is ElementType =>
  Number.isFinite(a) && a !== 0;

const is = isNonZeroFiniteNumber;

export const toNonZeroFiniteNumber = castType<ElementType>(
  is,
  typeNameInMessage,
);

const to = toNonZeroFiniteNumber;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: '-1.2', value: -1.2 },
    { name: '0', value: 0 },
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => to(value)).toThrow(
      new TypeError(`Expected ${typeNameInMessage}, got: ${value}`),
    );
  });
}

const abs = (x: ElementType): ToNonNegative<ElementType> => to(Math.abs(x));

if (import.meta.vitest !== undefined) {
  expectType<ToNonNegative<ElementType>, PositiveFiniteNumber>('=');
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

// 0 にならないようにする妥当な丸め演算が定義できないので提供しない
const floor = (x: ElementType): ToInt<ElementType> => Math.floor(x);
const ceil = (x: ElementType): ToInt<ElementType> => Math.ceil(x);
const round = (x: ElementType): ToInt<ElementType> => Math.round(x);

if (import.meta.vitest !== undefined) {
  expectType<ToInt<ElementType>, NonZeroInt>('=');
  expectType<RemoveNonZeroKey<ToInt<ElementType>>, Int>('=');
}

export const NonZeroFiniteNumber = {
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
} as const satisfies NumberClass<ElementType, 'none'>;
