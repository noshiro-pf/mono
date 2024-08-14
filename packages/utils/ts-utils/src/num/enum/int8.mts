import { expectType } from '../../expect-type.mjs';
import { RefinedNumberUtils as U } from '../refined-number-utils.mjs';

const typeName = 'Int8';
const typeNameInMessage = 'an integer in [-128, 127]';

const {
  MIN_VALUE,
  MAX_VALUE,
  random: randomImpl,
  is: isImpl,
  castTo: castToImpl,
  clamp: clampImpl,
} = U.operatorsForInteger<Int16, -128, 127>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: -128,
  MAX_VALUE: 127,
  typeNameInMessage,
} as const);

const is = (x: number): x is Int8 => isImpl(x);

const castTo = (x: number): Int8 =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  castToImpl(x) as Int8;

const clamp = (a: number): Int8 => castTo(clampImpl(a));

const abs = <N extends Int8>(x: N): AbsoluteValue<N> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  Math.abs(x) as unknown as AbsoluteValue<N>;

const _min = (...values: readonly Int8[]): Int8 => castTo(Math.min(...values));

const _max = (...values: readonly Int8[]): Int8 => castTo(Math.max(...values));

const pow = (x: Int8, y: Int8): Int8 => castTo(x ** y);

const add = (x: Int8, y: Int8): Int8 => castTo(x + y);

const sub = (x: Int8, y: Int8): Int8 => castTo(x - y);

const mul = (x: Int8, y: Int8): Int8 => castTo(x * y);

const div = (x: Int8, y: Exclude<Int8, 0>): Int8 => castTo(x / y);

const random = (min: Int8, max: Int8): Int8 =>
  castTo(randomImpl(castToImpl(min), castToImpl(max)));

export const isInt8 = is;
export const toInt8 = castTo;

export const Int8 = {
  is,

  /** `-128` */
  MIN_VALUE,

  /** `127` */
  MAX_VALUE,

  min: _min,
  max: _max,
  clamp,

  abs,
  random,

  /** @returns `a ** b`, but clamped to `[-128, 127]` */
  pow,

  /** @returns `a + b`, but clamped to `[-128, 127]` */
  add,

  /** @returns `a - b`, but clamped to `[-128, 127]` */
  sub,

  /** @returns `a * b`, but clamped to `[-128, 127]` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[-128, 127]` */
  div,
} as const;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: '1.2', value: 1.2 },
    { name: '-3.4', value: -3.4 },
    { name: '128', value: 128 },
    { name: '-129', value: -129 },
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
  });

  expectType<keyof typeof Int8, keyof U.NumberClass<Int16, 'int' | 'range'>>(
    '=',
  );
}
