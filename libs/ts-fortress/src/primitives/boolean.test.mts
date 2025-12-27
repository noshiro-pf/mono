import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { boolean } from './boolean.mjs';

describe(boolean, () => {
  const targetType = boolean(false);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, boolean>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = true;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: unknown = 'not a boolean';

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
      const result = targetType.validate(true);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      assert.isTrue(resultValue);
    });

    test('falsy case', () => {
      const result = targetType.validate('not a boolean');

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: 'not a boolean',
          expectedType: 'boolean',
          typeName: 'boolean',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected <boolean> type but <string> type value "not a boolean" was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = false;

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });

  describe('assertIs', () => {
    test('truthy case', () => {
      const x: unknown = false;

      const assertIs: (a: unknown) => asserts a is boolean =
        targetType.assertIs;

      expect(() => {
        assertIs(x);
      }).not.toThrowError();
    });

    test('falsy case', () => {
      const x: unknown = 'not a boolean';

      const assertIs: (a: unknown) => asserts a is boolean =
        targetType.assertIs;

      expect(() => {
        assertIs(x);
      }).toThrowError('Error');
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = true;

      assert.isTrue(targetType.cast(x));
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrowError('Error');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = true;

      assert.isTrue(targetType.fill(x));
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a boolean';

      assert.isFalse(targetType.fill(x));
    });
  });
});
