import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { positiveInt } from './positive-int.mjs';

describe(positiveInt, () => {
  const targetType = positiveInt(1);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, PositiveInt>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 123;

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

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(isTarget);
    });

    test('falsy case - negative', () => {
      const x: unknown = -5;

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

      const isTarget = targetType.is(x);

      if (isTarget) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(isTarget);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(42);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(42);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 123;

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case - negative', () => {
      const result = targetType.validate(-5);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: -5,
          expectedType: 'PositiveInt',
          typeName: 'PositiveInt',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected <PositiveInt> type but <number> type value `-5` was passed.',
      ]);
    });

    test('falsy case - string', () => {
      const result = targetType.validate('not a number');

      assert.isTrue(Result.isErr(result));

      const resultError1 = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError1, [
        {
          path: [],
          actualValue: 'not a number',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError1), [
        'Error: expected <number> type but <string> type value "not a number" was passed.',
      ]);
    });
  });

  describe('assertIs', () => {
    test('truthy case', () => {
      const x: unknown = 42;

      const assertIs: (a: unknown) => asserts a is TargetType =
        targetType.assertIs;

      expect(() => {
        assertIs(x);
      }).not.toThrowError();
    });

    test('falsy case', () => {
      const x: unknown = -42;

      const assertIs: (a: unknown) => asserts a is TargetType =
        targetType.assertIs;

      expect(() => {
        assertIs(x);
      }).toThrowError('Error: expected <PositiveInt> type');
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 100;

      expect(targetType.cast(x)).toBe(100);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrowError('Error');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = 123;

      expect(targetType.fill(x)).toBe(123);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a positive int';

      expect(targetType.fill(x)).toBe(1);
    });
  });
});
