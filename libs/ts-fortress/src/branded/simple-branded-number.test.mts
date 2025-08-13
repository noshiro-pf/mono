import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../validation-error.mjs';
import { simpleBrandedNumber } from './simple-branded-number.mjs';

describe('simpleBrandedNumber', () => {
  describe('with default value', () => {
    const userIdType = simpleBrandedNumber('UserId');

    type UserId = TypeOf<typeof userIdType>;

    expectType<UserId, Brand<number, 'UserId'>>('=');

    expectType<typeof userIdType.defaultValue, UserId>('=');

    test('creates branded number type with default value 0', () => {
      expect(userIdType.defaultValue).toBe(0);
      expect(userIdType.typeName).toBe('UserId');
    });

    describe('is', () => {
      test('returns true for any number', () => {
        expect(userIdType.is(123)).toBe(true);
        expect(userIdType.is(-456)).toBe(true);
        expect(userIdType.is(0)).toBe(true);
        expect(userIdType.is(3.14)).toBe(true);
      });

      test('returns false for non-numbers', () => {
        expect(userIdType.is('123')).toBe(false);
        expect(userIdType.is(null)).toBe(false);
        expect(userIdType.is(undefined)).toBe(false);
        expect(userIdType.is({})).toBe(false);
        expect(userIdType.is([])).toBe(false);
      });
    });

    describe('validate', () => {
      test('succeeds for valid numbers', () => {
        const result = userIdType.validate(42);
        expect(Result.isOk(result)).toBe(true);

        if (Result.isOk(result)) {
          expect(result.value).toBe(42);
        }
      });

      test('fails for non-numbers', () => {
        const result = userIdType.validate('not a number');
        expect(Result.isErr(result)).toBe(true);

        if (Result.isErr(result)) {
          expect(result.value).toStrictEqual([
            {
              path: [],
              actualValue: 'not a number',
              expectedType: 'number',
              typeName: 'number',
              message: undefined,
            },
          ]);
          expect(validationErrorsToMessages(result.value)).toStrictEqual([
            'Expected number, got string',
          ]);
        }
      });
    });

    describe('cast', () => {
      test('succeeds for valid numbers', () => {
        expect(userIdType.cast(789)).toBe(789);
      });

      test('throws for invalid values', () => {
        expect(() => userIdType.cast('invalid')).toThrow('Expected');
      });
    });

    describe('fill', () => {
      test('returns value for valid numbers', () => {
        expect(userIdType.fill(456)).toBe(456);
      });

      test('returns default value for invalid values', () => {
        expect(userIdType.fill('invalid')).toBe(0);
      });
    });
  });

  describe('with custom default value', () => {
    const scoreType = simpleBrandedNumber('Score', 100);

    type Score = TypeOf<typeof scoreType>;

    expectType<Score, Brand<number, 'Score'>>('=');

    test('creates branded number type with custom default value', () => {
      expect(scoreType.defaultValue).toBe(100);
      expect(scoreType.typeName).toBe('Score');
    });

    describe('validate', () => {
      test('succeeds for valid numbers', () => {
        const result = scoreType.validate(85);
        expect(Result.isOk(result)).toBe(true);

        if (Result.isOk(result)) {
          expect(result.value).toBe(85);
        }
      });

      test('fails for non-numbers', () => {
        const result = scoreType.validate('invalid');
        expect(Result.isErr(result)).toBe(true);

        if (Result.isErr(result)) {
          expect(result.value).toStrictEqual([
            {
              path: [],
              actualValue: 'invalid',
              expectedType: 'number',
              typeName: 'number',
              message: undefined,
            },
          ]);
          expect(validationErrorsToMessages(result.value)).toStrictEqual([
            'Expected number, got string',
          ]);
        }
      });
    });

    describe('fill', () => {
      test('returns value for valid numbers', () => {
        expect(scoreType.fill(95)).toBe(95);
      });

      test('returns custom default value for invalid values', () => {
        expect(scoreType.fill('invalid')).toBe(100);
      });
    });
  });

  describe('type assertions and narrowing', () => {
    const priceType = simpleBrandedNumber('Price', 0);

    test('type narrowing works correctly', () => {
      const x: unknown = 29.99;

      if (priceType.is(x)) {
        expectType<typeof x, Brand<number, 'Price'>>('=');
        expect(x).toBe(29.99);
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(priceType.is(x)).toBe(true);
    });
  });
});
