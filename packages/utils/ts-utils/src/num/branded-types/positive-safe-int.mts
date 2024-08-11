import { expectType } from '../../expect-type.mjs';
import { RefinedNumberUtils as U } from '../refined-number-utils.mjs';

type ElementType = PositiveSafeInt;
const typeName = 'PositiveSafeInt';
const typeNameInMessage = 'a positive safe integer';

const {
  MIN_VALUE,
  MAX_VALUE,
  min: _min,
  max: _max,
  pow,
  add,
  sub,
  mul,
  div,
  random,
  is,
  castTo,
  clamp,
} = U.operatorsForInteger<ElementType, 1, SafeUint>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 1,
  MAX_VALUE: Number.MAX_SAFE_INTEGER,
  typeNameInMessage,
} as const);

export const isPositiveSafeInt = is;
export const toPositiveSafeInt = castTo;

export const PositiveSafeInt = {
  is,

  /** `1` */
  MIN_VALUE,

  /** `Number.MAX_SAFE_INTEGER` */
  MAX_VALUE,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[1, MAX_SAFE_INTEGER]` */
  pow,

  /** @returns `a + b`, but clamped to `[1, MAX_SAFE_INTEGER]` */
  add,

  /** @returns `a - b`, but clamped to `[1, MAX_SAFE_INTEGER]` */
  sub,

  /** @returns `a * b`, but clamped to `[1, MAX_SAFE_INTEGER]` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[1, MAX_SAFE_INTEGER]` */
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
    { name: '-1', value: -1 },
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => castTo(value)).toThrow(
      new TypeError(`Expected ${typeNameInMessage}, got: ${value}`),
    );
  });

  test(`${typeName}.random`, () => {
    const min = 1;
    const max = 5;
    const result = random(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });

  expectType<
    keyof typeof PositiveSafeInt,
    keyof U.NumberClass<ElementType, 'int' | 'positive' | 'range'>
  >('=');

  expectType<
    typeof PositiveSafeInt,
    U.NumberClass<ElementType, 'int' | 'positive' | 'range'>
  >('<=');
}
