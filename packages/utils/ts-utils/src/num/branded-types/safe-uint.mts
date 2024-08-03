import { Num } from '../num.mjs';
import {
  castType,
  type NumberClass,
  type ToNonZeroIntWithSmallInt,
} from './utils.mjs';

type ElementType = SafeUint;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const typeName = 'SafeUint';

const typeNameInMessage = 'a non-negative safe integer';

const MIN_VALUE = 0;
const MAX_VALUE = Number.MAX_SAFE_INTEGER;

export const isSafeUint = (a: number): a is ElementType =>
  Number.isSafeInteger(a) && Num.isNonNegative(a);

export const toSafeUint = castType<ElementType>(isSafeUint, typeNameInMessage);

const to = toSafeUint;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: '1.2', value: 1.2 },
    { name: '-3.4', value: -3.4 },
    { name: '-1', value: -1 },
  ] as const)(`to${typeName}($name) should throw a TypeError`, ({ value }) => {
    expect(() => to(value)).toThrow(
      new TypeError(`Expected ${typeNameInMessage}, got: ${value}`),
    );
  });
}

const _c = Num.clamp<number>(MIN_VALUE, MAX_VALUE);
const clamp = (a: number): ElementType => to(Math.round(_c(a)));

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
): ElementType => clamp(Math.floor(x / y));

const random = (
  min: ElementTypeWithSmallInt,
  max: ElementTypeWithSmallInt,
): ElementType =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

if (import.meta.vitest !== undefined) {
  test(`${typeName}.random`, () => {
    const r = random(0, 5);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(5);
  });
}

export const SafeUint = {
  MIN_VALUE,
  MAX_VALUE,

  min: _min,
  max: _max,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[0, MAX_SAFE_INTEGER]` */
  pow,

  /** @returns `a + b`, but clamped to `[0, MAX_SAFE_INTEGER]` */
  add,

  /** @returns `a - b`, but clamped to `[0, MAX_SAFE_INTEGER]` */
  sub,

  /** @returns `a * b`, but clamped to `[0, MAX_SAFE_INTEGER]` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[0, MAX_SAFE_INTEGER]` */
  div,
} as const satisfies NumberClass<ElementType, 'int' | 'non-negative' | 'range'>;
