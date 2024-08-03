import { Num } from '../num.mjs';
import { toFiniteNumber } from './finite-number.mjs';
import { Int } from './int.mjs';
import {
  castType,
  type NumberClass,
  type ToNonNegative,
  type ToNonZeroIntWithSmallInt,
} from './utils.mjs';

type ElementType = NonZeroSafeInt;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const typeName = 'NonZeroSafeInt';

const typeNameInMessage = 'a non-zero safe integer';

const MIN_VALUE = Number.MIN_SAFE_INTEGER;
const MAX_VALUE = Number.MAX_SAFE_INTEGER;

export const isNonZeroInt = (a: number): a is ElementType =>
  Number.isSafeInteger(a) && a !== 0;

const is = isNonZeroInt;

export const toNonZeroInt = castType<ElementType>(is, typeNameInMessage);

const to = toNonZeroInt;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: '1.2', value: 1.2 },
    { name: '-3.4', value: -3.4 },
    { name: '0', value: 0 },
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => to(value)).toThrow(
      new TypeError(`Expected ${typeNameInMessage}, got: ${value}`),
    );
  });
}

const _c = Num.clamp<number>(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): ElementType => to(Math.round(_c(a)));

const abs = (x: ElementTypeWithSmallInt): ToNonNegative<ElementType> =>
  Math.abs(to(x));

const _min = (...values: readonly ElementTypeWithSmallInt[]): ElementType =>
  to(Math.min(...values));

const _max = (...values: readonly ElementTypeWithSmallInt[]): ElementType =>
  to(Math.max(...values));

const pow = (
  x: ElementTypeWithSmallInt,
  y: ElementTypeWithSmallInt,
): ElementType => clamp(x ** y);

const add = (
  x: ElementTypeWithSmallInt,
  y: ElementTypeWithSmallInt,
): ElementType => clamp(x + y);

const sub = (
  x: ElementTypeWithSmallInt,
  y: ElementTypeWithSmallInt,
): ElementType => clamp(x - y);

const mul = (
  x: ElementTypeWithSmallInt,
  y: ElementTypeWithSmallInt,
): ElementType => clamp(x * y);

const div = (
  x: ElementTypeWithSmallInt,
  y: ToNonZeroIntWithSmallInt<ElementType>,
): ElementType => clamp(Math.floor(toFiniteNumber(x / y)));

const random = (
  min: ElementTypeWithSmallInt,
  max: ElementTypeWithSmallInt,
): ElementType => {
  let mut_r = 0;
  while (mut_r === 0) {
    mut_r = Int.random(min, max);
  }
  return to(mut_r);
};

if (import.meta.vitest !== undefined) {
  test(`${typeName}.random`, () => {
    const r = random(-5, 5);
    expect(r).toBeGreaterThanOrEqual(-5);
    expect(r).toBeLessThanOrEqual(5);
    expect(r).not.toBe(0);
  });
}

export const NonZeroSafeInt = {
  MIN_VALUE,
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
} as const satisfies NumberClass<ElementType, 'int' | 'range'>;
