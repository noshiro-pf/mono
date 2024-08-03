import { Num } from '../num.mjs';
import { castType, type ToNonZeroIntWithSmallInt } from './utils.mjs';

type ElementType = PositiveSafeInt;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const typeName = 'PositiveSafeInt';

const MIN_VALUE = 1;
const MAX_VALUE = Number.MAX_SAFE_INTEGER;

export const isPositiveSafeInt = (a: number): a is ElementType =>
  Number.isSafeInteger(a) && Num.isNonNegative(a) && Num.isNonZero(a);

export const toPositiveSafeInt = castType<ElementType>(
  isPositiveSafeInt,
  'a positive safe integer',
);

if (import.meta.vitest !== undefined) {
  test(`to${typeName}(-1) should throw a TypeError`, () => {
    expect(toPositiveSafeInt(-1)).throws(
      new TypeError('Expected a positive safe integer, got: -1'),
    );
  });
}

const to = toPositiveSafeInt;

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
    const r = random(1, 5);
    expect(r).toBeGreaterThanOrEqual(1);
    expect(r).toBeLessThanOrEqual(5);
  });
}

export const PositiveSafeInt = {
  MIN_VALUE,
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
