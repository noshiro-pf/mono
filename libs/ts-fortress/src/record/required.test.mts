import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { optional, type OptionalPropertyType } from './optional.mjs';
import { record } from './record.mjs';
import { required, type RequiredType } from './required.mjs';

describe(required, () => {
  describe('fully required', () => {
    const ymdBase = record({
      year: optional(number(1900)),
      month: optional(number(1)),
      date: optional(number(1)),
    });

    const ymd = required(ymdBase);

    expectType<
      typeof ymd,
      RequiredType<
        Readonly<{
          year: OptionalPropertyType<Type<number>>;
          month: OptionalPropertyType<Type<number>>;
          date: OptionalPropertyType<Type<number>>;
        }>,
        undefined
      >
    >('=');

    expectType<
      typeof ymd,
      Type<
        Readonly<{
          year: number;
          month: number;
          date: number;
        }>
      > &
        Readonly<{
          shape: Readonly<{
            year: Type<number>;
            month: Type<number>;
            date: Type<number>;
          }>;
          excessPropertyValidation: 'strip';
          excessPropertyFill: 'allow' | 'strip';
        }>
    >('=');

    type Ymd = TypeOf<typeof ymd>;

    expectType<
      Ymd,
      Required<Readonly<{ year: number; month: number; date: number }>>
    >('=');

    expectType<typeof ymd.defaultValue, Ymd>('=');

    describe('is', () => {
      test('truthy case', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 12,
        };

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        expect(ymd.is(x)).toBe(true);
      });

      test('falsy case - missing required property', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          // missing date - this should fail since date is now required
        };

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        expect(ymd.is(x)).toBe(false);
      });

      test('falsy case - wrong type', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        };

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        expect(ymd.is(x)).toBe(false);
      });
    });

    describe('validate', () => {
      test('truthy case', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 25,
        };

        const result = ymd.validate(x);

        expectType<typeof result, Result<Ymd, readonly ValidationError[]>>('=');

        expect(Result.isOk(result)).toBe(true);

        const resultValue = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue, {
          year: 2000,
          month: 12,
          date: 25,
        });
      });

      test('validate returns input as-is for OK cases', () => {
        const input: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 25,
        };

        const result = ymd.validate(input);

        expect(Result.isOk(result)).toBe(true);

        const resultValue1 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue1, input); // Deep equality

        // In strip mode (default), a new object is created even without excess properties
        expect(resultValue1).not.toBe(input); // Different reference
      });

      test('validate returns input as-is for OK cases (allow mode)', () => {
        const ymdBaseAllow = record(
          {
            year: optional(number(1900)),
            month: optional(number(1)),
            date: optional(number(1)),
          },
          { excessPropertyValidation: 'allow' },
        );

        const ymdAllow = required(ymdBaseAllow);

        const input: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 25,
        };

        const result = ymdAllow.validate(input);

        expect(Result.isOk(result)).toBe(true);

        const resultValue1 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue1, input); // Deep equality

        // In allow mode, the same reference is returned
        expect(resultValue1).toBe(input); // Same reference
      });

      test('falsy case - missing required property', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          // missing date - this should fail since date is now required
        };

        const result = ymd.validate(x);

        expect(Result.isErr(result)).toBe(true);

        const resultError = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError, [
          {
            path: ['date'],
            actualValue: { year: 2000, month: 12 },
            expectedType:
              'Required<{ year: number, month: number, date: number }>',
            typeName: 'Required<{ year: number, month: number, date: number }>',
            details: {
              kind: 'missing-key',
              key: 'date',
            },
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError), [
          'Error at date: missing required key "date".',
        ]);
      });

      test('truthy case with additional keys', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 25,
          aaa: 999,
        };

        const result = ymd.validate(x);

        expectType<typeof result, Result<Ymd, readonly ValidationError[]>>('=');

        expect(Result.isOk(result)).toBe(true);

        const resultValue2 = Result.unwrapThrow(result);

        assert.deepStrictEqual(
          resultValue2,
          ymd.cast({
            year: 2000,
            month: 12,
            date: 25,
            aaa: 999,
          }),
        );
      });

      test('validate returns input as-is for OK cases with additional keys', () => {
        const input: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 25,
          aaa: 999,
        };

        const result = ymd.validate(input);

        expect(Result.isOk(result)).toBe(true);

        const resultValue3 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue3, {
          year: 2000,
          month: 12,
          date: 25,
        });

        expect(resultValue3).not.toBe(input); // Different reference
      });

      test('falsy case - wrong type', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        };

        const result = ymd.validate(x);

        expect(Result.isErr(result)).toBe(true);

        const resultError1 = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError1, [
          {
            path: ['month'],
            actualValue: 'ab',
            expectedType: 'number',
            typeName: 'number',
            details: undefined,
          },
          {
            path: ['date'],
            actualValue: 'cd',
            expectedType: 'number',
            typeName: 'number',
            details: undefined,
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError1), [
          'Error at month: expected <number> value but <string> type value "ab" was passed.',
          'Error at date: expected <number> value but <string> type value "cd" was passed.',
        ]);
      });

      test('falsy case - single wrong type', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 12,
        };

        const result = ymd.validate(x);

        expect(Result.isErr(result)).toBe(true);

        const resultError2 = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError2, [
          {
            path: ['month'],
            actualValue: 'ab',
            expectedType: 'number',
            typeName: 'number',
            details: undefined,
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError2), [
          'Error at month: expected <number> value but <string> type value "ab" was passed.',
        ]);
      });
    });

    describe('fill', () => {
      test('from an empty record', () => {
        const x: UnknownRecord = {};

        assert.deepStrictEqual(ymd.fill(x), {
          year: 1900,
          month: 1,
          date: 1,
        });
      });

      test('from a filled record', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 999,
          date: 999,
        };

        assert.deepStrictEqual(ymd.fill(x), {
          year: 2000,
          month: 999,
          date: 999,
        });
      });

      test('from a partial record', () => {
        const x: UnknownRecord = {
          year: 2000,
        };

        assert.deepStrictEqual(ymd.fill(x), {
          year: 2000,
          month: 1,
          date: 1,
        });
      });

      test('from a partial record with excess property', () => {
        const x: UnknownRecord = {
          year: 2000,
          aaaaa: 9999,
        };

        assert.deepStrictEqual(ymd.fill(x), {
          year: 2000,
          month: 1,
          date: 1,
        });
      });
    });
  });

  describe('partially required', () => {
    const ymdBase = record({
      year: optional(number(1900)),
      month: optional(number(1)),
      date: optional(number(1)),
    });

    const ymd = required(ymdBase, { keysToBeRequired: ['year', 'month'] });

    type Ymd = TypeOf<typeof ymd>;

    expectType<Ymd, Readonly<{ year: number; month: number; date?: number }>>(
      '=',
    );

    expectType<typeof ymd.defaultValue, Ymd>('=');

    describe('is', () => {
      test('truthy case - required fields only', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
        };

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        expect(ymd.is(x)).toBe(true);
      });

      test('truthy case - with optional field', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 15,
        };

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        expect(ymd.is(x)).toBe(true);
      });

      test('falsy case - missing required field', () => {
        const x: UnknownRecord = {
          year: 2000,
          // missing month
          date: 15,
        };

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        expect(ymd.is(x)).toBe(false);
      });

      test('falsy case - wrong type in required field', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        };

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        expect(ymd.is(x)).toBe(false);
      });

      test('falsy case - wrong type in optional field', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 'cd',
        };

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        expect(ymd.is(x)).toBe(false);
      });
    });

    describe('validate', () => {
      test('truthy case - required fields only', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
        };

        const result = ymd.validate(x);

        expectType<typeof result, Result<Ymd, readonly ValidationError[]>>('=');

        expect(Result.isOk(result)).toBe(true);

        const resultValue4 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue4, {
          year: 2000,
          month: 12,
        });
      });

      test('partiallyRequiredType validate returns input as-is for OK cases', () => {
        const input: UnknownRecord = {
          year: 2000,
          month: 12,
        };

        const result = ymd.validate(input);

        expect(Result.isOk(result)).toBe(true);

        const resultValue5 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue5, input); // Deep equality

        // In strip mode (default), a new object is created even without excess properties
        expect(resultValue5).not.toBe(input); // Different reference
      });

      test('partiallyRequiredType validate returns input as-is for OK cases (allow mode)', () => {
        const ymdBaseAllow = record(
          {
            year: optional(number(1900)),
            month: optional(number(1)),
            date: optional(number(1)),
          },
          { excessPropertyValidation: 'allow' },
        );

        const ymdAllow = required(ymdBaseAllow, {
          keysToBeRequired: ['year', 'month'],
        });

        const input: UnknownRecord = {
          year: 2000,
          month: 12,
        };

        const result = ymdAllow.validate(input);

        expect(Result.isOk(result)).toBe(true);

        const resultValue5 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue5, input); // Deep equality

        // In allow mode, the same reference is returned
        expect(resultValue5).toBe(input); // Same reference
      });

      test('truthy case - with optional field', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 15,
        };

        const result = ymd.validate(x);

        expect(Result.isOk(result)).toBe(true);

        const resultValue6 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue6, {
          year: 2000,
          month: 12,
          date: 15,
        });
      });

      test('falsy case - missing required field', () => {
        const x: UnknownRecord = {
          year: 2000,
          // missing month
          date: 15,
        };

        const result = ymd.validate(x);

        expect(Result.isErr(result)).toBe(true);

        const resultError3 = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError3, [
          {
            path: ['month'],
            actualValue: { year: 2000, date: 15 },
            expectedType:
              'PartiallyRequired<{ year: number, month: number, date: number }, "year" | "month">',
            typeName:
              'PartiallyRequired<{ year: number, month: number, date: number }, "year" | "month">',
            details: {
              kind: 'missing-key',
              key: 'month',
            },
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError3), [
          'Error at month: missing required key "month".',
        ]);
      });

      test('falsy case - wrong types', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        };

        const result = ymd.validate(x);

        expect(Result.isErr(result)).toBe(true);

        const resultError4 = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError4, [
          {
            path: ['month'],
            actualValue: 'ab',
            expectedType: 'number',
            typeName: 'number',
            details: undefined,
          },
          {
            path: ['date'],
            actualValue: 'cd',
            expectedType: 'number',
            typeName: 'number',
            details: undefined,
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError4), [
          'Error at month: expected <number> value but <string> type value "ab" was passed.',
          'Error at date: expected <number> value but <string> type value "cd" was passed.',
        ]);
      });
    });

    describe('fill', () => {
      test('from an empty record', () => {
        const x: UnknownRecord = {};

        assert.deepStrictEqual(ymd.fill(x), {
          year: 1900,
          month: 1,
          date: 1,
        });
      });

      test('from a filled record', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 999,
          date: 999,
        };

        assert.deepStrictEqual(ymd.fill(x), {
          year: 2000,
          month: 999,
          date: 999,
        });
      });

      test('from a partial record - required fields only', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
        };

        assert.deepStrictEqual(ymd.fill(x), {
          year: 2000,
          month: 12,
          date: 1,
        });
      });

      test('from a partial record - missing required field', () => {
        const x: UnknownRecord = {
          year: 2000,
          // missing month - fill should provide default
        };

        assert.deepStrictEqual(ymd.fill(x), {
          year: 2000,
          month: 1,
          date: 1,
        });
      });

      test('from a partial record with excess property', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          aaaaa: 9999,
        };

        assert.deepStrictEqual(ymd.fill(x), {
          year: 2000,
          month: 12,
          date: 1,
        });
      });
    });
  });
});
