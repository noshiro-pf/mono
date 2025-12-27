import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { positiveSafeInt } from './positive-safe-int.mjs';

describe(positiveSafeInt, () => {
  const targetType = positiveSafeInt(1);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, PositiveSafeInt>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 123_456;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(isTarget);
    });

    test('falsy case - zero', () => {
      const x: unknown = 0;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });

    test('falsy case - negative', () => {
      const x: unknown = -5;

      assert.isFalse(targetType.is(x));
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
      const result = targetType.validate(789_012);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(789_012);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 123_456;

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
          expectedType: 'PositiveSafeInt',
          typeName: 'PositiveSafeInt',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected <PositiveSafeInt> type but <number> type value `0` was passed.',
      ]);
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 100_000;

      expect(targetType.cast(x)).toBe(100_000);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrowError('Error');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = 456_789;

      expect(targetType.fill(x)).toBe(456_789);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a positive safe int';

      expect(targetType.fill(x)).toBe(1);
    });
  });
});
