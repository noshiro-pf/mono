import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { bigint } from './bigint.mjs';

describe('bigint', () => {
  const targetType = bigint(0n);

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, bigint>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: unknown = 123n;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: unknown = 123;

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(targetType.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(456n);
      expect(Result.isOk(result)).toBe(true);

      const resultValue = Result.unwrapThrow(result);
      expect(resultValue).toBe(456n);
    });

    test('falsy case', () => {
      const result = targetType.validate(123);
      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);
      expect(resultError).toStrictEqual([
        {
          path: [],
          actualValue: 123,
          expectedType: 'bigint',
          typeName: 'bigint',
          message: undefined,
        },
      ]);

      expect(validationErrorsToMessages(resultError)).toStrictEqual([
        'Expected <bigint>, got <number> type value `123`.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 999n;
      const result = targetType.validate(input);
      expect(Result.isOk(result)).toBe(true);
      const resultValue1 = Result.unwrapThrow(result);
      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });

  describe('assertIs', () => {
    test('truthy case', () => {
      const x: unknown = 789n;

      const assertIs: (a: unknown) => asserts a is bigint = targetType.assertIs;
      expect(() => {
        assertIs(x);
      }).not.toThrow();
    });

    test('falsy case', () => {
      const x: unknown = 'not a bigint';

      const assertIs: (a: unknown) => asserts a is bigint = targetType.assertIs;
      expect(() => {
        assertIs(x);
      }).toThrow('Expected');
    });
  });

  describe('cast', () => {
    test('truthy case', () => {
      const x: unknown = 999n;

      expect(targetType.cast(x)).toBe(999n);
    });

    test('falsy case', () => {
      const x: unknown = 'invalid';

      expect(() => targetType.cast(x)).toThrow('Expected');
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: unknown = 111n;

      expect(targetType.fill(x)).toBe(111n);
    });

    test('fill with the default value', () => {
      const x: unknown = 'not a bigint';

      expect(targetType.fill(x)).toBe(0n);
    });
  });
});
