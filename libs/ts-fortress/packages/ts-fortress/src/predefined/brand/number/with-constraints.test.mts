import { expectType, Result } from 'ts-data-forge';
import {
  type Int,
  type NegativeFiniteNumber,
  type NegativeInt,
  type NegativeSafeInt,
  type NonPositiveFiniteNumber,
  type NonPositiveInt,
  type NonPositiveSafeInt,
  type Uint,
} from 'ts-type-forge';
import { type TypeOf } from '../../../type.mjs';
import { int } from './int.mjs';
import { negativeFiniteNumber } from './negative-finite-number.mjs';
import { negativeInt } from './negative-int.mjs';
import { negativeSafeInt } from './negative-safe-int.mjs';
import { nonPositiveFiniteNumber } from './non-positive-finite-number.mjs';
import { nonPositiveInt } from './non-positive-int.mjs';
import { nonPositiveSafeInt } from './non-positive-safe-int.mjs';
import { uint } from './uint.mjs';

describe('branded number with range constraints', () => {
  describe('result types are unchanged by range constraints', () => {
    // numeric-range constraints add runtime validation but keep the base brand
    const intMax = int(0, { max: 10 });

    expectType<TypeOf<typeof intMax>, Int>('=');

    const intRange = int(5, { min: 1, max: 10 });

    expectType<TypeOf<typeof intRange>, Int>('=');

    const uintStep = uint(0, { multipleOf: 2 });

    expectType<TypeOf<typeof uintStep>, Uint>('=');

    test('the range-constrained types validate as expected', () => {
      assert.isTrue(intMax.is(10));

      assert.isFalse(intMax.is(11));

      assert.isTrue(intRange.is(1));

      assert.isFalse(intRange.is(0));

      assert.isTrue(uintStep.is(4));

      assert.isFalse(uintStep.is(3));
    });
  });

  describe('runtime validation', () => {
    test('int constrained by max', () => {
      const type = int(5, { max: 10 });

      assert.isTrue(type.is(10));

      assert.isTrue(type.is(-3));

      assert.isFalse(type.is(11)); // exceeds max

      assert.isFalse(type.is(5.5)); // not an integer
    });

    test('int constrained by min and max', () => {
      const type = int(5, { min: 1, max: 10 });

      assert.isTrue(type.is(1));

      assert.isTrue(type.is(10));

      assert.isFalse(type.is(0));

      assert.isFalse(type.is(11));
    });

    test('validate reports constraint violation', () => {
      const type = int(5, { max: 10 });

      assert.isTrue(Result.isOk(type.validate(8)));

      assert.isTrue(Result.isErr(type.validate(20)));
    });

    test('omitting constraints does not change behavior', () => {
      const type = int(0);

      assert.isTrue(type.is(123));

      assert.isFalse(type.is(1.5));
    });
  });

  describe('brand-changing flags are rejected at compile time', () => {
    test('branded constructors only accept numeric-range constraints', () => {
      // Compile-time checks only; the body is type-checked but never executed.
      const typeChecks = (): void => {
        // @ts-expect-error `int` is not a range constraint
        int(0, { int: true });

        // @ts-expect-error `nonNegative` is not a range constraint
        int(0, { nonNegative: true });

        // @ts-expect-error `positive` is not a range constraint
        uint(0, { positive: true });

        // @ts-expect-error `nonzero` is not a range constraint
        uint(0, { nonzero: true });
      };

      expect(typeChecks).toBeInstanceOf(Function);

      // a non-redundant range constraint is still accepted
      const type = int(0, { max: 10 });

      assert.isTrue(type.is(10));
    });
  });

  describe('default value validation', () => {
    test('throws when the default value violates a constraint', () => {
      expect(() => int(50, { max: 10 })).toThrow('max = 10');
    });

    test('throws when the default value fails the base brand predicate', () => {
      expect(() => int(1.5, { max: 10 })).toThrow("doesn't pass `is` function");
    });
  });

  describe('negative-side branded numbers', () => {
    const negFinite = negativeFiniteNumber(-1);

    expectType<TypeOf<typeof negFinite>, NegativeFiniteNumber>('=');

    const negInt = negativeInt(-1);

    expectType<TypeOf<typeof negInt>, NegativeInt>('=');

    const negSafe = negativeSafeInt(-1);

    expectType<TypeOf<typeof negSafe>, NegativeSafeInt>('=');

    // range constraints keep the base brand type
    const negBounded = negativeFiniteNumber(-1, { min: -10 });

    expectType<TypeOf<typeof negBounded>, NegativeFiniteNumber>('=');

    test('negative types validate as expected', () => {
      assert.isTrue(negFinite.is(-0.5));

      assert.isFalse(negFinite.is(0));

      assert.isFalse(negFinite.is(1));

      assert.isTrue(negInt.is(-3));

      assert.isFalse(negInt.is(-3.5));

      assert.isTrue(negSafe.is(-3));

      assert.isFalse(negSafe.is(-3.5));

      assert.isTrue(negBounded.is(-10));

      assert.isFalse(negBounded.is(-11)); // below min
    });

    test('default value must be negative', () => {
      expect(() => negativeFiniteNumber(0)).toThrow(
        "doesn't pass `is` function",
      );

      expect(() => negativeInt(0)).toThrow("doesn't pass `is` function");
    });
  });

  describe('non-positive-side branded numbers', () => {
    const nonPosFinite = nonPositiveFiniteNumber(0);

    expectType<TypeOf<typeof nonPosFinite>, NonPositiveFiniteNumber>('=');

    const nonPosInt = nonPositiveInt(0);

    expectType<TypeOf<typeof nonPosInt>, NonPositiveInt>('=');

    const nonPosSafe = nonPositiveSafeInt(0);

    expectType<TypeOf<typeof nonPosSafe>, NonPositiveSafeInt>('=');

    // range constraints keep the base brand type
    const nonPosBounded = nonPositiveFiniteNumber(0, { min: -10 });

    expectType<TypeOf<typeof nonPosBounded>, NonPositiveFiniteNumber>('=');

    test('non-positive types validate as expected', () => {
      assert.isTrue(nonPosFinite.is(0));

      assert.isTrue(nonPosFinite.is(-0.5));

      assert.isFalse(nonPosFinite.is(1));

      assert.isTrue(nonPosInt.is(0));

      assert.isTrue(nonPosInt.is(-3));

      assert.isFalse(nonPosInt.is(-3.5));

      assert.isTrue(nonPosSafe.is(0));

      assert.isTrue(nonPosSafe.is(-3));

      assert.isFalse(nonPosSafe.is(-3.5));

      assert.isTrue(nonPosBounded.is(-10));

      assert.isFalse(nonPosBounded.is(-11)); // below min
    });

    test('default value must be non-positive', () => {
      expect(() => nonPositiveFiniteNumber(1)).toThrow(
        "doesn't pass `is` function",
      );

      expect(() => nonPositiveInt(1)).toThrow("doesn't pass `is` function");
    });
  });
});
