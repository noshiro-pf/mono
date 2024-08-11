import { expectType } from '../../expect-type.mjs';
import { RefinedNumberUtils as U } from '../refined-number-utils.mjs';

const typeName = 'Uint8';
const typeNameInMessage = 'an non-negative integer less than 256';

const {
  MIN_VALUE,
  MAX_VALUE,
  min: minImpl,
  max: maxImpl,
  pow: powImpl,
  add: addImpl,
  sub: subImpl,
  mul: mulImpl,
  div: divImpl,
  random: randomImpl,
  is: isImpl,
  castTo: castToImpl,
  clamp: clampImpl,
} = U.operatorsForInteger<Uint16, 0, 255>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: 0,
  MAX_VALUE: 255,
  typeNameInMessage,
} as const);

const is = (x: number): x is Uint8 => isImpl(x);

const castTo = (x: number): Uint8 =>
  // eslint-disable-next-line no-restricted-syntax
  castToImpl(x) as Uint8;

const clamp = (a: number): Uint8 => castTo(clampImpl(a));

const _min = (...values: readonly Uint8[]): Uint8 => castTo(minImpl(...values));

const _max = (...values: readonly Uint8[]): Uint8 => castTo(maxImpl(...values));

const pow = (x: Uint8, y: Uint8): Uint8 => castTo(powImpl(x, y));

const add = (x: Uint8, y: Uint8): Uint8 => castTo(addImpl(x, y));

const sub = (x: Uint8, y: Uint8): Uint8 => castTo(subImpl(x, y));

const mul = (x: Uint8, y: Uint8): Uint8 => castTo(mulImpl(x, y));

const div = (x: Uint8, y: Exclude<Uint8, 0>): Uint8 => castTo(divImpl(x, y));

const random = (min: Uint8, max: Uint8): Uint8 => castTo(randomImpl(min, max));

export const isUint8 = is;
export const toUint8 = castTo;

export const Uint8 = {
  is,

  /** `0` */
  MIN_VALUE,

  /** `255` */
  MAX_VALUE,

  max: _max,
  min: _min,
  clamp,

  random,

  /** @returns `a ** b`, but clamped to `[0, 255]` */
  pow,

  /** @returns `a + b`, but clamped to `[0, 255]` */
  add,

  /** @returns `a - b`, but clamped to `[0, 255]` */
  sub,

  /** @returns `a * b`, but clamped to `[0, 255]` */
  mul,

  /** @returns `⌊a / b⌋`, but clamped to `[0, 255]` */
  div,
} as const;

if (import.meta.vitest !== undefined) {
  test.each([
    { name: 'Number.NaN', value: Number.NaN },
    { name: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY },
    { name: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY },
    { name: '1.2', value: 1.2 },
    { name: '-3.4', value: -3.4 },
    { name: '256', value: 256 },
    { name: '-129', value: -129 },
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
    keyof typeof Uint8,
    keyof U.NumberClass<Uint16, 'int' | 'non-negative' | 'range'>
  >('=');
}
