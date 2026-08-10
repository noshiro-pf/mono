import { asInt32, expectType, Result } from 'ts-data-forge';
import { type Int32 } from 'ts-type-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { int32 } from './int32.mjs';

describe(int32, () => {
  const targetType = int32(asInt32(0));

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, Int32>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 1_000_000;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(isTarget);
    });

    test('falsy case - too large', () => {
      const x: unknown = 3_000_000_000;

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(isTarget);
    });

    test('falsy case - float', () => {
      const x: unknown = 123.456;

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(-1_000_000);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(-1_000_000);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 1_000_000;

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case - out of range', () => {
      const result = targetType.validate(3_000_000_000);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: 3_000_000_000,
          expectedType: 'Int32',
          typeName: 'Int32',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected <Int32> type but <number> type value `3000000000` was passed.',
      ]);
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 150_000_000;

      expect(targetType.cast(x)).toBe(150_000_000);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Error');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = -50_000_000;

      expect(targetType.fill(x)).toBe(-50_000_000);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not an int32';

      expect(targetType.fill(x)).toBe(0);
    });
  });
});
