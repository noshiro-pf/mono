import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { optional } from './optional.mjs';
import { record } from './record.mjs';
import { required } from './required.mjs';

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
      Type<
        Readonly<
          Required<Readonly<{ year: number; month: number; date: number }>>
        >
      >
    >('=');

    expectType<
      (typeof ymd)['defaultValue'],
      Readonly<{
        year: number;
        month: number;
        date: number;
      }>
    >('=');

    expectType<
      (typeof ymd)['validate'],
      (a: unknown) => Result<
        Readonly<{
          year: number;
          month: number;
          date: number;
        }>,
        readonly ValidationError[]
      >
    >('=');

    expectType<
      keyof typeof ymd,
      | 'typeName'
      | 'is'
      | 'validate'
      | 'assertIs'
      | 'cast'
      | 'defaultValue'
      | 'fill'
      | 'optional'
    >('=');

    type Ymd = TypeOf<typeof ymd>;

    expectType<
      Ymd,
      Required<Readonly<{ year: number; month: number; date: number }>>
    >('=');

    expectType<typeof ymd.defaultValue, TypeOf<typeof ymd>>('=');

    describe('is', () => {
      test('truthy case', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 12,
        } as const;

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        assert.isTrue(ymd.is(x));
      });

      test('falsy case - missing required property', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          // missing date - this should fail since date is now required
        } as const;

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        assert.isFalse(ymd.is(x));
      });

      test('falsy case - wrong type', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        } as const;

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        assert.isFalse(ymd.is(x));
      });
    });

    describe('validate', () => {
      test('truthy case', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 25,
        } as const;

        const result = ymd.validate(x);

        expectType<typeof result, Result<Ymd, readonly ValidationError[]>>('=');

        assert.isTrue(Result.isOk(result));

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
        } as const;

        const result = ymd.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue1 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue1, input); // Deep equality

        // In allow mode (default), same reference is returned
        expect(resultValue1).toBe(input); // Same reference
      });

      test('validate rejects excess properties when excessProperty is "reject"', () => {
        const ymdBaseReject = record(
          {
            year: optional(number(1900)),
            month: optional(number(1)),
            date: optional(number(1)),
          },
          { excessProperty: 'reject' },
        );

        const ymdReject = required(ymdBaseReject);

        const input: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 25,
          extra: 'not allowed',
        } as const;

        const result = ymdReject.validate(input);

        assert.isTrue(Result.isErr(result));
      });

      test('validate accepts valid data without excess when excessProperty is "reject"', () => {
        const ymdBaseReject = record(
          {
            year: optional(number(1900)),
            month: optional(number(1)),
            date: optional(number(1)),
          },
          { excessProperty: 'reject' },
        );

        const ymdReject = required(ymdBaseReject);

        const input: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 25,
        } as const;

        const result = ymdReject.validate(input);

        assert.isTrue(Result.isOk(result));

        expect(Result.unwrapThrow(result)).toBe(input); // ✅ same reference
      });

      test('falsy case - missing required property', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          // missing date - this should fail since date is now required
        } as const;

        const result = ymd.validate(x);

        assert.isTrue(Result.isErr(result));

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
        } as const;

        const result = ymd.validate(x);

        expectType<typeof result, Result<Ymd, readonly ValidationError[]>>('=');

        assert.isTrue(Result.isOk(result));

        const resultValue2 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue2 as UnknownRecord, {
          year: 2000,
          month: 12,
          date: 25,
          aaa: 999,
        });
      });

      test('validate returns input as-is for OK cases with additional keys', () => {
        const input: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 25,
          aaa: 999,
        } as const;

        const result = ymd.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue3 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue3 as UnknownRecord, {
          year: 2000,
          month: 12,
          date: 25,
          aaa: 999,
        });

        // In allow mode (default), excess properties are kept → same reference
        expect(resultValue3).toBe(input);
      });

      test('falsy case - wrong type', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        } as const;

        const result = ymd.validate(x);

        assert.isTrue(Result.isErr(result));

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
          'Error at month: expected <number> type but <string> type value "ab" was passed.',
          'Error at date: expected <number> type but <string> type value "cd" was passed.',
        ]);
      });

      test('falsy case - single wrong type', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 12,
        } as const;

        const result = ymd.validate(x);

        assert.isTrue(Result.isErr(result));

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
          'Error at month: expected <number> type but <string> type value "ab" was passed.',
        ]);
      });
    });

    describe('fill', () => {
      test('from an empty record', () => {
        const x: UnknownRecord = {} as const;

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
        } as const;

        assert.deepStrictEqual(ymd.fill(x), {
          year: 2000,
          month: 999,
          date: 999,
        });
      });

      test('from a partial record', () => {
        const x: UnknownRecord = {
          year: 2000,
        } as const;

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
        } as const;

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

    expectType<typeof ymd.defaultValue, TypeOf<typeof ymd>>('=');

    describe('is', () => {
      test('truthy case - required fields only', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
        } as const;

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        assert.isTrue(ymd.is(x));
      });

      test('truthy case - with optional field', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 15,
        } as const;

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        assert.isTrue(ymd.is(x));
      });

      test('falsy case - missing required field', () => {
        const x: UnknownRecord = {
          year: 2000,
          // missing month
          date: 15,
        } as const;

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        assert.isFalse(ymd.is(x));
      });

      test('falsy case - wrong type in required field', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        } as const;

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        assert.isFalse(ymd.is(x));
      });

      test('falsy case - wrong type in optional field', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 'cd',
        } as const;

        if (ymd.is(x)) {
          expectType<typeof x, Ymd>('=');
        } else {
          expectType<typeof x, UnknownRecord>('=');
        }

        assert.isFalse(ymd.is(x));
      });
    });

    describe('validate', () => {
      test('truthy case - required fields only', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
        } as const;

        const result = ymd.validate(x);

        expectType<typeof result, Result<Ymd, readonly ValidationError[]>>('=');

        assert.isTrue(Result.isOk(result));

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
        } as const;

        const result = ymd.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue5 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue5, input); // Deep equality

        // In allow mode (default), same reference is returned
        expect(resultValue5).toBe(input); // Same reference
      });

      test('partiallyRequiredType validate rejects excess properties when excessProperty is "reject"', () => {
        const ymdBaseReject = record(
          {
            year: optional(number(1900)),
            month: optional(number(1)),
            date: optional(number(1)),
          },
          { excessProperty: 'reject' },
        );

        const ymdReject = required(ymdBaseReject, {
          keysToBeRequired: ['year', 'month'],
        });

        const input: UnknownRecord = {
          year: 2000,
          month: 12,
          extra: 'not allowed',
        } as const;

        const result = ymdReject.validate(input);

        assert.isTrue(Result.isErr(result));
      });

      test('partiallyRequiredType validate accepts valid data without excess when excessProperty is "reject"', () => {
        const ymdBaseReject = record(
          {
            year: optional(number(1900)),
            month: optional(number(1)),
            date: optional(number(1)),
          },
          { excessProperty: 'reject' },
        );

        const ymdReject = required(ymdBaseReject, {
          keysToBeRequired: ['year', 'month'],
        });

        const input: UnknownRecord = {
          year: 2000,
          month: 12,
        } as const;

        const result = ymdReject.validate(input);

        assert.isTrue(Result.isOk(result));

        expect(Result.unwrapThrow(result)).toBe(input); // ✅ same reference
      });

      test('truthy case - with optional field', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 15,
        } as const;

        const result = ymd.validate(x);

        assert.isTrue(Result.isOk(result));

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
        } as const;

        const result = ymd.validate(x);

        assert.isTrue(Result.isErr(result));

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
        } as const;

        const result = ymd.validate(x);

        assert.isTrue(Result.isErr(result));

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
          'Error at month: expected <number> type but <string> type value "ab" was passed.',
          'Error at date: expected <number> type but <string> type value "cd" was passed.',
        ]);
      });
    });

    describe('fill', () => {
      test('from an empty record', () => {
        const x: UnknownRecord = {} as const;

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
        } as const;

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
        } as const;

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
        } as const;

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
        } as const;

        assert.deepStrictEqual(ymd.fill(x), {
          year: 2000,
          month: 12,
          date: 1,
        });
      });
    });
  });
});
