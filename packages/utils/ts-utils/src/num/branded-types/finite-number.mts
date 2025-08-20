import { expectType } from '../../expect-type.mjs';
import { RefinedNumberUtils as U } from '../refined-number-utils.mjs';

type ElementType = FiniteNumber;
const typeName = 'FiniteNumber';
const typeNameInMessage = 'a finite number';

const {
  abs,
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
} = U.operatorsForFloat<ElementType, undefined, undefined>({
  MIN_VALUE: undefined,
  MAX_VALUE: undefined,
  typeNameInMessage,
} as const);

const floor = (x: ElementType): U.ToInt<ElementType> => Math.floor(x);
const ceil = (x: ElementType): U.ToInt<ElementType> => Math.ceil(x);
const round = (x: ElementType): U.ToInt<ElementType> => Math.round(x);

if (import.meta.vitest !== undefined) {
  expectType<U.ToInt<ElementType>, Int>('=');
}

export const toFiniteNumber = castTo;

export const FiniteNumber = {
  is,

  abs,

  min: min_,
  max: max_,

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
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => castTo(value)).toThrow(
      new TypeError(`Expected ${typeNameInMessage}, got: ${value}`),
    );
  });

  expectType<U.ToNonNegative<ElementType>, NonNegativeFiniteNumber>('=');

  test(`${typeName}.random`, () => {
    const min = castTo(-2.3);
    const max = castTo(4.5);
    const result = random(min, max);
    expect(result).toBeGreaterThanOrEqual(min);
    expect(result).toBeLessThanOrEqual(max);
  });

  expectType<
    keyof typeof FiniteNumber,
    keyof U.NumberClass<ElementType, never>
  >('=');
  expectType<typeof FiniteNumber, U.NumberClass<ElementType, never>>('<=');
}

const positiveBrand = Symbol();

export type Positive = number & { [positiveBrand]: true };
export type Negative = number & { [positiveBrand]: false };
type T = Positive & Negative;
