import { expectType } from '../../expect-type.mjs';
import { RefinedNumberUtils as U } from '../refined-number-utils.mjs';

type ElementType = NonZeroSafeInt;
const typeName = 'NonZeroSafeInt';
const typeNameInMessage = 'a non-zero safe integer';

const {
  MIN_VALUE,
  MAX_VALUE,
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
  clamp,
} = U.operatorsForInteger<ElementType, SafeInt, SafeUint>({
  integerOrSafeInteger: 'SafeInteger',
  nonZero: true,
  MIN_VALUE: Number.MIN_SAFE_INTEGER,
  MAX_VALUE: Number.MAX_SAFE_INTEGER,
  typeNameInMessage,
} as const);

export const isNonZeroSafeInt = is;
export const toNonZeroSafeInt = castTo;

export const NonZeroSafeInt = {
  is,

  /** `Number.MIN_SAFE_INTEGER` */
  MIN_VALUE,

  /** `Number.MAX_SAFE_INTEGER` */
  MAX_VALUE,

  abs,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[MIN_SAFE_INTEGER, MAX_SAFE_INTEGER]` */
  pow,

  /** @returns `a + b`, but clamped to `[MIN_SAFE_INTEGER, MAX_SAFE_INTEGER]` */
  add,

  /** @returns `a - b`, but clamped to `[MIN_SAFE_INTEGER, MAX_SAFE_INTEGER]` */
  sub,

  /** @returns `a * b`, but clamped to `[MIN_SAFE_INTEGER, MAX_SAFE_INTEGER]` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[MIN_SAFE_INTEGER, MAX_SAFE_INTEGER]` */
  div,
} as const;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: '1.2', value: 1.2 },
    { name: '-3.4', value: -3.4 },
    { name: '0', value: 0 },
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
    expect(result).not.toBe(0);
  });

  expectType<
    keyof typeof NonZeroSafeInt,
    keyof U.NumberClass<ElementType, 'int' | 'range'>
  >('=');

  expectType<
    typeof NonZeroSafeInt,
    U.NumberClass<ElementType, 'int' | 'range'>
  >('<=');
}
