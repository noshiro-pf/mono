import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { enumType } from './enum.mjs';

describe(enumType, () => {
  const targetType = enumType([3, '2', 'a'], {
    defaultValue: 3,
  });

  type TargetType = TypeOf<typeof targetType>;

  expectType<TargetType, '2' | 'a' | 3>('=');

  expectType<typeof targetType.defaultValue, TargetType>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: number | string = Math.random() >= 0 ? 3 : '0'; // the value is always 1

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, number | string>('=');
      }

      assert.isTrue(targetType.is(x));
    });

    test('falsy case', () => {
      const x: number | string = Math.random() >= 0 ? 5 : '0'; // the value is always 5

      if (targetType.is(x)) {
        expectType<typeof x, TargetType>('=');
      } else {
        expectType<typeof x, number | string>('=');
      }

      assert.isFalse(targetType.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const result = targetType.validate(3);

      expectType<typeof result, Result<TargetType, readonly ValidationError[]>>(
        '=',
      );

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe(3);
    });

    test('falsy case', () => {
      const result = targetType.validate(5);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError[0], {
        path: [],
        actualValue: 5,
        expectedType: 'enum',
        typeName: 'enum',
        details: {
          kind: 'enum',
          values: [3, '2', 'a'] as const,
        },
      });

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error: expected one of { 3, 2, a } but `5` was passed.',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 'a';

      const result = targetType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });

  describe('fill', () => {
    test('noop', () => {
      const x: number = (() => 3)();

      expect(targetType.fill(x)).toBe(3);
    });

    test('fill with the default value', () => {
      const x: number = (() => 5)();

      expect(targetType.fill(x)).toBe(3);
    });
  });
});

describe('enumType with allowAnyString', () => {
  const color = enumType(['red', 'green', 'blue'], {
    allowAnyString: true,
    defaultValue: '',
  });

  type Color = TypeOf<typeof color>;

  // Autocomplete is preserved for the listed members via the open-union idiom,
  // while any other string is still part of the type.
  expectType<Color, 'red' | 'green' | 'blue' | (string & {})>('=');

  expectType<typeof color.defaultValue, Color>('=');

  describe('is', () => {
    test('accepts a listed member', () => {
      assert.isTrue(color.is('red'));
    });

    test('accepts any other string at runtime (behaves like string())', () => {
      assert.isTrue(color.is('purple'));
    });

    test('rejects non-string values', () => {
      assert.isFalse(color.is(42));
    });
  });

  describe('validate', () => {
    test('returns an unlisted string as-is', () => {
      const result = color.validate('purple');

      assert.isTrue(Result.isOk(result));

      expect(Result.unwrapThrow(result)).toBe('purple');
    });

    test('rejects non-string values with a string-type error', () => {
      const result = color.validate(42);

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(
        validationErrorsToMessages(Result.unwrapErrThrow(result)),
        [
          'Error: expected <string> type but <number> type value `42` was passed.',
        ],
      );
    });
  });

  describe('default value and fill', () => {
    test('uses the configured default value', () => {
      expect(color.defaultValue).toBe('');
    });

    test('keeps any string', () => {
      const x: unknown = 'anything';

      expect(color.fill(x)).toBe('anything');
    });

    test('non-string falls back to the default value', () => {
      const x: unknown = 123;

      expect(color.fill(x)).toBe('');
    });
  });
});
