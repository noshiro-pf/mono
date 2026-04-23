import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../../../type.mjs';
import { validationErrorsToMessages } from '../../../utils/index.mjs';
import { int } from './int.mjs';

describe(int, () => {
  const targetType = int(0);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, Int>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 123;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case - float', () => {
      const x: unknown = 123.456;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });

    test('falsy case - string', () => {
      const x: unknown = '123';

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(42);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(42);
    });

    test('falsy case - float', () => {
      const result = targetType.validate(42.5);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: 42.5,
          expectedType: 'Int',
          typeName: 'Int',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected <Int> type but <number> type value `42.5` was passed.',
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

    test('validate returns input as-is for OK cases', () => {
      const input = 123;

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });

  describe('assertIs', () => {
    test('truthy case', () => {
      const x: unknown = -42;

      const assertIs: (a: unknown) => asserts a is TargetType =
        targetType.assertIs;

      expect(() => {
        assertIs(x);
      }).not.toThrow();
    });

    test('falsy case', () => {
      const x: unknown = 42.5;

      const assertIs: (a: unknown) => asserts a is TargetType =
        targetType.assertIs;

      expect(() => {
        assertIs(x);
      }).toThrow('Error: expected <Int> type');
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 100;

      expect(targetType.cast(x)).toBe(100);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Error');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = -123;

      expect(targetType.fill(x)).toBe(-123);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not an int';

      expect(targetType.fill(x)).toBe(0);
    });
  });
});
