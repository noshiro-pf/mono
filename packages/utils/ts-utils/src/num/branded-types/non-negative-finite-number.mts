import { expectType } from '../../expect-type.mjs';
import { RefinedNumberUtils as U } from '../refined-number-utils.mjs';

type ElementType = NonNegativeFiniteNumber;
const typeName = 'NonNegativeFiniteNumber';
const typeNameInMessage = 'a non-negative finite number';

const {
  MIN_VALUE,
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
} = U.operatorsForFloat<ElementType, 0, undefined>({
  MIN_VALUE: 0,
  MAX_VALUE: undefined,
  typeNameInMessage,
} as const);

const floor = (x: ElementType): U.ToInt<ElementType> => Math.floor(x);
const ceil = (x: ElementType): U.ToInt<ElementType> => Math.ceil(x);
const round = (x: ElementType): U.ToInt<ElementType> => Math.round(x);

if (import.meta.vitest !== undefined) {
  expectType<U.ToInt<ElementType>, Uint>('=');
}

export const isNonNegativeFiniteNumber = is;
export const toNonNegativeFiniteNumber = castTo;

export const NonNegativeFiniteNumber = {
  is,

  /** `0` */
  MIN_VALUE,

  min: min_,
  max: max_,
  clamp,

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
} as const;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: '-1.2', value: -1.2 },
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => castTo(value)).toThrow(
      new TypeError(`Expected ${typeNameInMessage}, got: ${value}`),
    );
  });

  test(`${typeName}.random`, () => {
    const min = castTo(2.3);
    const max = castTo(4.5);
    const result = random(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });

  expectType<
    keyof typeof NonNegativeFiniteNumber,
    keyof U.NumberClass<ElementType, 'non-negative'>
  >('=');

  expectType<
    typeof NonNegativeFiniteNumber,
    U.NumberClass<ElementType, 'non-negative'>
  >('<=');
}
