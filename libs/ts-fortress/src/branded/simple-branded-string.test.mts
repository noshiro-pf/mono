import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { simpleBrandedString } from './simple-branded-string.mjs';

describe('simpleBrandedString', () => {
  describe('with default value', () => {
    const userNameType = simpleBrandedString('UserName');

    type UserName = TypeOf<typeof userNameType>;

    expectType<UserName, Brand<string, 'UserName'>>('=');

    expectType<typeof userNameType.defaultValue, UserName>('=');

    test('creates branded string type with default value empty string', () => {
      expect(userNameType.defaultValue).toBe('');
      expect(userNameType.typeName).toBe('UserName');
    });

    describe('is', () => {
      test('returns true for any string', () => {
        expect(userNameType.is('alice')).toBe(true);
        expect(userNameType.is('bob123')).toBe(true);
        expect(userNameType.is('')).toBe(true);
        expect(userNameType.is('special@chars!')).toBe(true);
      });

      test('returns false for non-strings', () => {
        expect(userNameType.is(123)).toBe(false);
        expect(userNameType.is(null)).toBe(false);
        expect(userNameType.is(undefined)).toBe(false);
        expect(userNameType.is({})).toBe(false);
        expect(userNameType.is([])).toBe(false);
        expect(userNameType.is(true)).toBe(false);
      });
    });

    describe('validate', () => {
      test('validate returns input as-is for OK cases', () => {
        const input = 'john_doe';
        const result = userNameType.validate(input);
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          expect(result.value).toBe(input); // ✅ same reference
        }
      });

      test('succeeds for valid strings', () => {
        const result = userNameType.validate('john_doe');
        expect(Result.isOk(result)).toBe(true);

        if (Result.isOk(result)) {
          expect(result.value).toBe('john_doe');
        }
      });

      test('fails for non-strings', () => {
        const result = userNameType.validate(42);
        expect(Result.isErr(result)).toBe(true);

        if (Result.isErr(result)) {
          expect(result.value).toStrictEqual([
            {
              path: [],
              actualValue: 42,
              expectedType: 'string',
              typeName: 'string',
              message: undefined,
            },
          ]);
          expect(validationErrorsToMessages(result.value)).toStrictEqual([
            'Expected string, got number',
          ]);
        }
      });
    });

    describe('cast', () => {
      test('succeeds for valid strings', () => {
        expect(userNameType.cast('jane')).toBe('jane');
      });

      test('throws for invalid values', () => {
        expect(() => userNameType.cast(123)).toThrow('Expected');
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
    const categoryType = simpleBrandedString('Category', 'general');

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
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          expect(result.value).toBe(input); // ✅ same reference
        }
      });

      test('succeeds for valid strings', () => {
        const result = categoryType.validate('technology');
        expect(Result.isOk(result)).toBe(true);

        if (Result.isOk(result)) {
          expect(result.value).toBe('technology');
        }
      });

      test('fails for non-strings', () => {
        const result = categoryType.validate(null);
        expect(Result.isErr(result)).toBe(true);

        if (Result.isErr(result)) {
          expect(result.value).toStrictEqual([
            {
              path: [],
              actualValue: null,
              expectedType: 'string',
              typeName: 'string',
              message: undefined,
            },
          ]);
          expect(validationErrorsToMessages(result.value)).toStrictEqual([
            'Expected string, got object',
          ]);
        }
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
    const emailType = simpleBrandedString('Email', '');

    test('type narrowing works correctly', () => {
      const x: unknown = 'user@example.com';

      if (emailType.is(x)) {
        expectType<typeof x, Brand<string, 'Email'>>('=');
        expect(x).toBe('user@example.com');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(emailType.is(x)).toBe(true);
    });
  });

  describe('different brand types', () => {
    const firstNameType = simpleBrandedString('FirstName', '');
    const lastNameType = simpleBrandedString('LastName', '');

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
