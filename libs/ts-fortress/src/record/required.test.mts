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

describe('required', () => {
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
          allowExcessProperties: boolean;
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

        if (Result.isOk(result)) {
          expect(result.value).toStrictEqual({
            year: 2000,
            month: 12,
            date: 25,
          });
        }
      });

      test('validate returns input as-is for OK cases', () => {
        const input: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 25,
        };
        const result = ymd.validate(input);
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          expect(result.value).toBe(input); // ✅ same reference
        }
      });

      test('falsy case - missing required property', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          // missing date - this should fail since date is now required
        };

        const result = ymd.validate(x);
        expect(Result.isErr(result)).toBe(true);

        if (Result.isErr(result)) {
          expect(result.value).toStrictEqual([
            {
              path: ['date'],
              actualValue: { year: 2000, month: 12 },
              expectedType:
                'Required<{ year: number, month: number, date: number }>',
              typeName:
                'Required<{ year: number, month: number, date: number }>',
              message: 'Missing required key "date"',
            },
          ]);
          expect(validationErrorsToMessages(result.value)).toStrictEqual([
            'Missing required key "date" at date',
          ]);
        }
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

        if (Result.isOk(result)) {
          expect(result.value).toStrictEqual({
            year: 2000,
            month: 12,
            date: 25,
            aaa: 999,
          });
        }
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
        if (Result.isOk(result)) {
          expect(result.value).toBe(input); // ✅ same reference
        }
      });

      test('falsy case - wrong type', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        };

        const result = ymd.validate(x);
        expect(Result.isErr(result)).toBe(true);

        if (Result.isErr(result)) {
          expect(result.value).toStrictEqual([
            {
              path: ['month'],
              actualValue: 'ab',
              expectedType: 'number',
              typeName: 'number',
              message: undefined,
            },
            {
              path: ['date'],
              actualValue: 'cd',
              expectedType: 'number',
              typeName: 'number',
              message: undefined,
            },
          ]);
          expect(validationErrorsToMessages(result.value)).toStrictEqual([
            'Expected <number> at month, got <string> type value "ab".',
            'Expected <number> at date, got <string> type value "cd".',
          ]);
        }
      });

      test('falsy case - single wrong type', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 12,
        };

        const result = ymd.validate(x);
        expect(Result.isErr(result)).toBe(true);

        if (Result.isErr(result)) {
          expect(result.value).toStrictEqual([
            {
              path: ['month'],
              actualValue: 'ab',
              expectedType: 'number',
              typeName: 'number',
              message: undefined,
            },
          ]);
          expect(validationErrorsToMessages(result.value)).toStrictEqual([
            'Expected <number> at month, got <string> type value "ab".',
          ]);
        }
      });
    });

    describe('fill', () => {
      test('from an empty record', () => {
        const x: UnknownRecord = {};

        expect(ymd.fill(x)).toStrictEqual({
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

        expect(ymd.fill(x)).toStrictEqual({
          year: 2000,
          month: 999,
          date: 999,
        });
      });

      test('from a partial record', () => {
        const x: UnknownRecord = {
          year: 2000,
        };

        expect(ymd.fill(x)).toStrictEqual({
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

        expect(ymd.fill(x)).toStrictEqual({
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

        if (Result.isOk(result)) {
          expect(result.value).toStrictEqual({
            year: 2000,
            month: 12,
          });
        }
      });

      test('partiallyRequiredType validate returns input as-is for OK cases', () => {
        const input: UnknownRecord = {
          year: 2000,
          month: 12,
        };
        const result = ymd.validate(input);
        expect(Result.isOk(result)).toBe(true);
        if (Result.isOk(result)) {
          expect(result.value).toBe(input); // ✅ same reference
        }
      });

      test('truthy case - with optional field', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 15,
        };

        const result = ymd.validate(x);
        expect(Result.isOk(result)).toBe(true);

        if (Result.isOk(result)) {
          expect(result.value).toStrictEqual({
            year: 2000,
            month: 12,
            date: 15,
          });
        }
      });

      test('falsy case - missing required field', () => {
        const x: UnknownRecord = {
          year: 2000,
          // missing month
          date: 15,
        };

        const result = ymd.validate(x);
        expect(Result.isErr(result)).toBe(true);

        if (Result.isErr(result)) {
          expect(result.value).toStrictEqual([
            {
              path: ['month'],
              actualValue: { year: 2000, date: 15 },
              expectedType:
                'PartiallyRequired<{ year: number, month: number, date: number }, "year" | "month">',
              typeName:
                'PartiallyRequired<{ year: number, month: number, date: number }, "year" | "month">',
              message: 'Missing required key "month"',
            },
          ]);
          expect(validationErrorsToMessages(result.value)).toStrictEqual([
            'Missing required key "month" at month',
          ]);
        }
      });

      test('falsy case - wrong types', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        };

        const result = ymd.validate(x);
        expect(Result.isErr(result)).toBe(true);

        if (Result.isErr(result)) {
          expect(result.value).toStrictEqual([
            {
              path: ['month'],
              actualValue: 'ab',
              expectedType: 'number',
              typeName: 'number',
              message: undefined,
            },
            {
              path: ['date'],
              actualValue: 'cd',
              expectedType: 'number',
              typeName: 'number',
              message: undefined,
            },
          ]);
          expect(validationErrorsToMessages(result.value)).toStrictEqual([
            'Expected <number> at month, got <string> type value "ab".',
            'Expected <number> at date, got <string> type value "cd".',
          ]);
        }
      });
    });

    describe('fill', () => {
      test('from an empty record', () => {
        const x: UnknownRecord = {};

        expect(ymd.fill(x)).toStrictEqual({
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

        expect(ymd.fill(x)).toStrictEqual({
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

        expect(ymd.fill(x)).toStrictEqual({
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

        expect(ymd.fill(x)).toStrictEqual({
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

        expect(ymd.fill(x)).toStrictEqual({
          year: 2000,
          month: 12,
          date: 1,
        });
      });
    });
  });
});
