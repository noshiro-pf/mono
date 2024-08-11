import { expectType } from '../../expect-type.mjs';
import { RefinedNumberUtils as U } from '../refined-number-utils.mjs';

type ElementType = NonZeroFiniteNumber;
const typeName = 'NonZeroFiniteNumber';
const typeNameInMessage = 'a non-zero finite number';

const {
  abs,
  min: _min,
  max: _max,
  pow,
  add,
  sub,
  mul,
  div,
  randomNonZero: random,
  is,
  castTo,
} = U.operatorsForFloat<ElementType, undefined, undefined>({
  nonZero: true,
  MIN_VALUE: undefined,
  MAX_VALUE: undefined,
  typeNameInMessage,
} as const);

// 0 にならないようにする妥当な丸め演算が定義できないので提供しない
const floor = (x: ElementType): U.ToInt<ElementType> => Math.floor(x);
const ceil = (x: ElementType): U.ToInt<ElementType> => Math.ceil(x);
const round = (x: ElementType): U.ToInt<ElementType> => Math.round(x);

if (import.meta.vitest !== undefined) {
  expectType<U.ToInt<ElementType>, NonZeroInt>('=');
  expectType<U.RemoveNonZeroBrandKey<U.ToInt<ElementType>>, Int>('=');
}

export const isNonZeroFiniteNumber = is;
export const toNonZeroFiniteNumber = castTo;

export const NonZeroFiniteNumber = {
  is,

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

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: '0', value: 0 },
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => castTo(value)).toThrow(
      new TypeError(`Expected ${typeNameInMessage}, got: ${value}`),
    );
  });

  expectType<U.ToNonNegative<ElementType>, PositiveFiniteNumber>('=');

  test(`${typeName}.random`, () => {
    const min = castTo(-2.3);
    const max = castTo(4.5);
    const result = random(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
    expect(result).not.toBe(0);
  });

  expectType<
    keyof typeof NonZeroFiniteNumber,
    keyof U.NumberClass<ElementType, never>
  >('=');
  expectType<typeof NonZeroFiniteNumber, U.NumberClass<ElementType, never>>(
    '<=',
  );
}
