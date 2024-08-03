import { Num } from '../num.mjs';
import { toFiniteNumber } from './finite-number.mjs';
import {
  castType,
  type ToNonNegative,
  type ToNonZeroIntWithSmallInt,
} from './utils.mjs';

type ElementType = SafeInt;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const typeName = 'SafeInt';

const typeNameInMessage = 'a safe integer';

const MIN_VALUE = Number.MIN_SAFE_INTEGER;
const MAX_VALUE = Number.MAX_SAFE_INTEGER;

export const toSafeInt = castType<ElementType>(
  Number.isSafeInteger,
  typeNameInMessage,
);

const to = toSafeInt;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: '1.2', value: 1.2 },
    { name: '-3.4', value: -3.4 },
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
): ElementType =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

if (import.meta.vitest !== undefined) {
  test(`${typeName}.random`, () => {
    const r = random(0, 5);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(5);
  });
}

export const SafeInt = {
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
} as const;
