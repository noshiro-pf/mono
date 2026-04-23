import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { brandedString } from './branded-string.mjs';

describe('simpleBrandedString', () => {
  describe('with default value', () => {
    const userNameType = brandedString({
      typeName: 'UserName',
      defaultValue: '',
    });

    type UserName = TypeOf<typeof userNameType>;

    expectType<UserName, Brand<string, 'UserName'>>('=');

    expectType<typeof userNameType.defaultValue, UserName>('=');

    test('creates branded string type with default value empty string', () => {
      expect(userNameType.defaultValue).toBe('');

      expect(userNameType.typeName).toBe('UserName');
    });

    describe('is', () => {
      test('returns true for any string', () => {
        assert.isTrue(userNameType.is('alice'));

        assert.isTrue(userNameType.is('bob123'));

        assert.isTrue(userNameType.is(''));

        assert.isTrue(userNameType.is('special@chars!'));
      });

      test('returns false for non-strings', () => {
        assert.isFalse(userNameType.is(123));

        assert.isFalse(userNameType.is(null));

        assert.isFalse(userNameType.is(undefined));

        assert.isFalse(userNameType.is({}));

        assert.isFalse(userNameType.is([]));

        assert.isFalse(userNameType.is(true));
      });
    });

    describe('validate', () => {
      test('validate returns input as-is for OK cases', () => {
        const input = 'john_doe';

        const result = userNameType.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue = Result.unwrapThrow(result);

        expect(resultValue).toBe(input); // ✅ same reference
      });

      test('succeeds for valid strings', () => {
        const result = userNameType.validate('john_doe');

        assert.isTrue(Result.isOk(result));

        const resultValue1 = Result.unwrapThrow(result);

        expect(resultValue1).toBe('john_doe');
      });

      test('fails for non-strings', () => {
        const result = userNameType.validate(42);

        assert.isTrue(Result.isErr(result));

        const resultError = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError, [
          {
            path: [],
            actualValue: 42,
            expectedType: 'string',
            typeName: 'string',
            details: undefined,
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError), [
          'Error: expected <string> type but <number> type value `42` was passed.',
        ]);
      });
    });

    describe('cast', () => {
      test('succeeds for valid strings', () => {
        expect(userNameType.cast('jane')).toBe('jane');
      });

      test('throws for invalid values', () => {
        expect(() => userNameType.cast(123)).toThrow('Error');
      });
    });

    describe('fill', () => {
      test('returns value for valid strings', () => {
        expect(userNameType.fill('charlie')).toBe('charlie');
      });

      test('returns default value for invalid values', () => {
        expect(userNameType.fill(123)).toBe('');
      });
    });
  });

  describe('with custom default value', () => {
    const categoryType = brandedString({
      typeName: 'Category',
      defaultValue: 'general',
    });

    type Category = TypeOf<typeof categoryType>;

    expectType<Category, Brand<string, 'Category'>>('=');

    test('creates branded string type with custom default value', () => {
      expect(categoryType.defaultValue).toBe('general');

      expect(categoryType.typeName).toBe('Category');
    });

    describe('validate', () => {
      test('validate returns input as-is for OK cases', () => {
        const input = 'technology';

        const result = categoryType.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue2 = Result.unwrapThrow(result);

        expect(resultValue2).toBe(input); // ✅ same reference
      });

      test('succeeds for valid strings', () => {
        const result = categoryType.validate('technology');

        assert.isTrue(Result.isOk(result));

        const resultValue3 = Result.unwrapThrow(result);

        expect(resultValue3).toBe('technology');
      });

      test('fails for non-strings', () => {
        const result = categoryType.validate(null);

        assert.isTrue(Result.isErr(result));

        const resultError1 = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError1, [
          {
            path: [],
            actualValue: null,
            expectedType: 'string',
            typeName: 'string',
            details: undefined,
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError1), [
          'Error: expected <string> type but <object> type value `null` was passed.',
        ]);
      });
    });

    describe('fill', () => {
      test('returns value for valid strings', () => {
        expect(categoryType.fill('sports')).toBe('sports');
      });

      test('returns custom default value for invalid values', () => {
        expect(categoryType.fill(false)).toBe('general');
      });
    });
  });

  describe('type assertions and narrowing', () => {
    const emailType = brandedString({
      typeName: 'Email',
      defaultValue: '',
    });

    test('type narrowing works correctly', () => {
      const x: unknown = 'user@example.com';

      const isEmail = emailType.is(x);

      if (isEmail) {
        expectType<typeof x, Brand<string, 'Email'>>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      assert.isTrue(isEmail);

      expect(x).toBe('user@example.com');
    });
  });

  describe('different brand types', () => {
    const firstNameType = brandedString({
      typeName: 'FirstName',
      defaultValue: '',
    });

    const lastNameType = brandedString({
      typeName: 'LastName',
      defaultValue: '',
    });

    test('creates distinct branded types', () => {
      type FirstName = TypeOf<typeof firstNameType>;

      type LastName = TypeOf<typeof lastNameType>;

      // These should be different types even though they're both branded strings

      expectType<FirstName, Brand<string, 'FirstName'>>('=');

      expectType<LastName, Brand<string, 'LastName'>>('=');

      expect(firstNameType.typeName).toBe('FirstName');

      expect(lastNameType.typeName).toBe('LastName');
    });
  });
});
