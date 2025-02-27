import { expectType } from '../../expect-type.mjs';
import { RefinedNumberUtils as U } from '../refined-number-utils.mjs';

type ElementType = Uint16;
const typeName = 'Uint16';
const typeNameInMessage = 'a non-negative integer less than 2^16';

const {
  MIN_VALUE,
  MAX_VALUE,
  min: min_,
  max: max_,
  pow,
  add,
  sub,
  mul,
  div,
  random,
  is,
  castTo,
  clamp,
} = U.operatorsForInteger<ElementType, 0, number>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 0,
  MAX_VALUE: 2 ** 16 - 1,
  typeNameInMessage,
} as const);

export const isUint16 = is;
export const toUint16 = castTo;

export const Uint16 = {
  is,

  /** `0` */
  MIN_VALUE,

  /** `2^16 - 1` */
  MAX_VALUE,

  min: min_,
  max: max_,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[0, 2^16)` */
  pow,

  /** @returns `a + b`, but clamped to `[0, 2^16)` */
  add,

  /** @returns `a - b`, but clamped to `[0, 2^16)` */
  sub,

  /** @returns `a * b`, but clamped to `[0, 2^16)` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[0, 2^16)` */
  div,
} as const;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: '1.2', value: 1.2 },
    { name: '-3.4', value: -3.4 },
    { name: '-1', value: -1 },
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => castTo(value)).toThrow(
      new TypeError(`Expected ${typeNameInMessage}, got: ${value}`),
    );
  });

  test(`${typeName}.random`, () => {
    const min = 0;
    const max = 5;
    const result = random(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });

  expectType<
    keyof typeof Uint16,
    keyof U.NumberClass<ElementType, 'int' | 'non-negative' | 'range'>
  >('=');

  expectType<
    typeof Uint16,
    U.NumberClass<ElementType, 'int' | 'non-negative' | 'range'>
  >('<=');
}
