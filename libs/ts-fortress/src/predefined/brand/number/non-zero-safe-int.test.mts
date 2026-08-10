import { asNonZeroSafeInt, expectType, Result } from 'ts-data-forge';
import { type NonZeroSafeInt } from 'ts-type-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { nonZeroSafeInt } from './non-zero-safe-int.mjs';

describe(nonZeroSafeInt, () => {
  const targetType = nonZeroSafeInt(asNonZeroSafeInt(1));

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, NonZeroSafeInt>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case - positive', () => {
      const x: unknown = 123_456;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(isTarget);
    });

    test('truthy case - negative', () => {
      const x: unknown = -42;

      assert.isTrue(targetType.is(x));
    });

    test('falsy case - zero', () => {
      const x: unknown = 0;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(isTarget);
    });

    test('falsy case - unsafe integer', () => {
      const x: unknown = Number.MAX_SAFE_INTEGER + 1;

      assert.isFalse(targetType.is(x));
    });

    test('falsy case - float', () => {
      const x: unknown = 123.456;

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(-789_012);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(-789_012);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 123;

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case - zero', () => {
      const result = targetType.validate(0);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: 0,
          expectedType: 'NonZeroSafeInt',
          typeName: 'NonZeroSafeInt',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected <NonZeroSafeInt> type but <number> type value `0` was passed.',
      ]);
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = -100_000;

      expect(targetType.cast(x)).toBe(-100_000);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Error');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = 456_789;

      expect(targetType.fill(x)).toBe(456_789);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a non zero safe int';

      expect(targetType.fill(x)).toBe(1);
    });
  });
});
