import { Num } from '../num.mjs';
import { castType, type ToNonZeroIntWithSmallInt } from './utils.mjs';

type ElementType = SafeUint;
type ElementTypeWithSmallInt = WithSmallInt<ElementType>;

const typeName = 'SafeUint';

const MIN_VALUE = 0;
const MAX_VALUE = Number.MAX_SAFE_INTEGER;

export const isSafeUint = (a: number): a is ElementType =>
  Number.isSafeInteger(a) && Num.isNonNegative(a);

export const toSafeUint = castType<ElementType>(
  isSafeUint,
  'a non-negative safe integer',
);

if (import.meta.vitest !== undefined) {
  test(`to${typeName}(1.2) should throw a TypeError`, () => {
    expect(() => toSafeUint(1.2)).toThrow(
      new TypeError('Expected a non-negative safe integer, got: 1.2'),
    );
  });
}

const to = toSafeUint;

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
} as const;
