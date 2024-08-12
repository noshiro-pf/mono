import { expectType } from '../../expect-type.mjs';
import { RefinedNumberUtils as U } from '../refined-number-utils.mjs';

type ElementType = Int16;
const typeName = 'Int16';
const typeNameInMessage = 'an integer in [-2^15, 2^15)';

const {
  MIN_VALUE,
  MAX_VALUE,
  min: _min,
  max: _max,
  abs,
  pow,
  add,
  sub,
  mul,
  div,
  random,
  is,
  castTo,
  clamp,
} = U.operatorsForInteger<ElementType, number, number>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: -(2 ** 15),
  MAX_VALUE: 2 ** 15 - 1,
  typeNameInMessage,
} as const);

export const isInt16 = is;
export const toInt16 = castTo;

export const Int16 = {
  is,

  /** -2^15` */
  MIN_VALUE,

  /** 2^15 - 1` */
  MAX_VALUE,

  abs,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[-2^15, 2^15)` */
  pow,

  /** @returns `a + b`, but clamped to `[-2^15, 2^15)` */
  add,

  /** @returns `a - b`, but clamped to `[-2^15, 2^15)` */
  sub,

  /** @returns `a * b`, but clamped to `[-2^15, 2^15)` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[-2^15, 2^15)` */
  div,
} as const;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: '1.2', value: 1.2 },
    { name: '-3.4', value: -3.4 },
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => castTo(value)).toThrow(
      new TypeError(`Expected ${typeNameInMessage}, got: ${value}`),
    );
  });

  test(`${typeName}.random`, () => {
    const min = -5;
    const max = 5;
    const result = random(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });

  expectType<
    keyof typeof Int16,
    keyof U.NumberClass<ElementType, 'int' | 'range'>
  >('=');
  expectType<typeof Int16, U.NumberClass<ElementType, 'int' | 'range'>>('<=');
}
