import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { brandedNumber } from './branded-number.mjs';

describe('simpleBrandedNumber', () => {
  describe('with default value', () => {
    const userIdType = brandedNumber({
      typeName: 'UserId',
      defaultValue: 0,
    });

    type UserId = TypeOf<typeof userIdType>;

    expectType<UserId, Brand<number, 'UserId'>>('=');

    expectType<typeof userIdType.defaultValue, UserId>('=');

    test('creates branded number type with default value 0', () => {
      expect(userIdType.defaultValue).toBe(0);

      expect(userIdType.typeName).toBe('"UserId"');
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
      test('validate returns input as-is for OK cases', () => {
        const input = 42;

        const result = userIdType.validate(input);

        expect(Result.isOk(result)).toBe(true);

        const resultValue = Result.unwrapThrow(result);

        expect(resultValue).toBe(input); // ✅ same reference
      });

      test('succeeds for valid numbers', () => {
        const result = userIdType.validate(42);

        expect(Result.isOk(result)).toBe(true);

        const resultValue1 = Result.unwrapThrow(result);

        expect(resultValue1).toBe(42);
      });

      test('fails for non-numbers', () => {
        const result = userIdType.validate('not a number');

        expect(Result.isErr(result)).toBe(true);

        const resultError = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError, [
          {
            path: [],
            actualValue: 'not a number',
            expectedType: 'number',
            typeName: 'number',
            details: undefined,
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError), [
          'Error: expected <number> value but <string> type value "not a number" was passed.',
        ]);
      });
    });

    describe('cast', () => {
      test('succeeds for valid numbers', () => {
        expect(userIdType.cast(789)).toBe(789);
      });

      test('throws for invalid values', () => {
        expect(() => userIdType.cast('invalid')).toThrow('Error');
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
    const scoreType = brandedNumber({
      typeName: 'Score',
      defaultValue: 100,
    });

    type Score = TypeOf<typeof scoreType>;

    expectType<Score, Brand<number, 'Score'>>('=');

    test('creates branded number type with custom default value', () => {
      expect(scoreType.defaultValue).toBe(100);

      expect(scoreType.typeName).toBe('"Score"');
    });

    describe('validate', () => {
      test('validate returns input as-is for OK cases', () => {
        const input = 85;

        const result = scoreType.validate(input);

        expect(Result.isOk(result)).toBe(true);

        const resultValue2 = Result.unwrapThrow(result);

        expect(resultValue2).toBe(input); // ✅ same reference
      });

      test('succeeds for valid numbers', () => {
        const result = scoreType.validate(85);

        expect(Result.isOk(result)).toBe(true);

        const resultValue3 = Result.unwrapThrow(result);

        expect(resultValue3).toBe(85);
      });

      test('fails for non-numbers', () => {
        const result = scoreType.validate('invalid');

        expect(Result.isErr(result)).toBe(true);

        const resultError1 = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError1, [
          {
            path: [],
            actualValue: 'invalid',
            expectedType: 'number',
            typeName: 'number',
            details: undefined,
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError1), [
          'Error: expected <number> value but <string> type value "invalid" was passed.',
        ]);
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
    const priceType = brandedNumber({
      typeName: 'Price',
      defaultValue: 0,
    });

    test('type narrowing works correctly', () => {
      const x: unknown = 29.99;

      const isPrice = priceType.is(x);

      if (isPrice) {
        expectType<typeof x, Brand<number, 'Price'>>('=');
      } else {
        expectType<typeof x, unknown>('=');
      }

      expect(isPrice).toBe(true);

      expect(x).toBe(29.99);
    });
  });
});
