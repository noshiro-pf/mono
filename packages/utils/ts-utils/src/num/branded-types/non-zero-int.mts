import { castType } from './to-type.mjs';

export const isNonZeroInt = (a: number): a is NonZeroInt =>
  Number.isInteger(a) && a !== 0;

export const toNonZeroInt = castType<NonZeroInt>(
  isNonZeroInt,
  'non-zero integer',
);

if (import.meta.vitest !== undefined) {
  test('toNonZeroInt(1.2) should throw a TypeError', () => {
    expect(toNonZeroInt(1.2)).throws(
      new TypeError('Expected integer, got: 1.2'),
    );
  });
}

const to = toNonZeroInt;

const abs = (x: NonZeroIntWithSmallInt): PositiveInt =>
  Math.abs(toNonZeroInt(x));

const _min = (...values: readonly NonZeroIntWithSmallInt[]): NonZeroInt =>
  to(Math.min(...values));

const _max = (...values: readonly NonZeroIntWithSmallInt[]): NonZeroInt =>
  to(Math.max(...values));

const pow = (
  x: NonZeroIntWithSmallInt,
  y: NonZeroIntWithSmallInt,
): NonZeroInt => to(x ** y);

const add = (
  x: NonZeroIntWithSmallInt,
  y: NonZeroIntWithSmallInt,
): NonZeroInt => to(x + y);

const sub = (
  x: NonZeroIntWithSmallInt,
  y: NonZeroIntWithSmallInt,
): NonZeroInt => to(x - y);

const mul = (
  x: NonZeroIntWithSmallInt,
  y: NonZeroIntWithSmallInt,
): NonZeroInt => to(x * y);

const div = (
  x: NonZeroIntWithSmallInt,
  y: NonZeroIntWithSmallInt,
): NonZeroInt => Math.floor(to(x / y));

const random = (
  min: NonZeroIntWithSmallInt,
  max: NonZeroIntWithSmallInt,
): NonZeroInt =>
  add(min, to(Math.floor((Math.max(max, min) - min + 1) * Math.random())));

if (import.meta.vitest !== undefined) {
  test('NonZeroInt.random() should throw a TypeError', () => {
    expect(random()).throws(new TypeError('Expected integer, got: 1.2'));
  });
}

export const NonZeroInt = {
  abs,

  min: _min,
  max: _max,

  random,

  /** @returns `a ** b` */
  pow,

  /** @returns `a + b` */
  add,

  /** @returns `a - b` */
  sub,

  /** @returns `a * b` */
  mul,

  /** @returns `⌊a / b⌋` */
  div,
} as const;
