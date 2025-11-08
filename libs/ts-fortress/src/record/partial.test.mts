import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { optional, type OptionalPropertyType } from './optional.mjs';
import { partial, type PartialType } from './partial.mjs';
import { record } from './record.mjs';

describe(partial, () => {
  describe('fully partial', () => {
    const ymdBase = record({
      year: number(1900),
      month: optional(number(1)),
      date: optional(number(1)),
    });

    const ymd = partial(ymdBase);

    expectType<
      typeof ymd,
      PartialType<
        Readonly<{
          year: Type<number>;
          month: Type<number>;
          date: Type<number>;
        }>,
        undefined
      >
    >('=');

    expectType<
      typeof ymd,
      Type<
        Readonly<{
          year?: number;
          month?: number;
          date?: number;
        }>
      > &
        Readonly<{
          shape: Readonly<{
            year: OptionalPropertyType<Type<number>>;
            month: OptionalPropertyType<Type<number>>;
            date: OptionalPropertyType<Type<number>>;
          }>;
          allowExcessProperties: boolean;
        }>
    >('=');

    type Ymd = TypeOf<typeof ymd>;

    expectType<
      Ymd,
      Partial<Readonly<{ year: number; month: number; date: number }>>
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

      test('falsy case', () => {
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

        expect(resultValue).toStrictEqual({
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

        expect(resultValue1).toBe(input); // ✅ same reference
      });

      test('truthy case optional keys', () => {
        const x: UnknownRecord = {};

        const result = ymd.validate(x);
        expectType<typeof result, Result<Ymd, readonly ValidationError[]>>('=');

        expect(Result.isOk(result)).toBe(true);

        const resultValue2 = Result.unwrapThrow(result);

        expect(resultValue2).toStrictEqual({});
      });

      test('validate returns input as-is for empty object', () => {
        const input: UnknownRecord = {};
        const result = ymd.validate(input);

        expect(Result.isOk(result)).toBe(true);

        const resultValue3 = Result.unwrapThrow(result);

        expect(resultValue3).toBe(input); // ✅ same reference
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

        const resultValue4 = Result.unwrapThrow(result);

        expect(resultValue4).toStrictEqual({
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
        };
        const result = ymd.validate(input);

        expect(Result.isOk(result)).toBe(true);

        const resultValue5 = Result.unwrapThrow(result);

        expect(resultValue5).toBe(input); // ✅ same reference
      });

      test('falsy case 1', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        };

        const result = ymd.validate(x);

        expect(Result.isErr(result)).toBe(true);

        const resultError = Result.unwrapErrThrow(result);

        expect(resultError).toStrictEqual([
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
        expect(validationErrorsToMessages(resultError)).toStrictEqual([
          'Expected <number> at month, got <string> type value "ab".',
          'Expected <number> at date, got <string> type value "cd".',
        ]);
      });

      test('falsy case 2', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
        };

        const result = ymd.validate(x);

        expect(Result.isErr(result)).toBe(true);

        const resultError1 = Result.unwrapErrThrow(result);

        expect(resultError1).toStrictEqual([
          {
            path: ['month'],
            actualValue: 'ab',
            expectedType: 'number',
            typeName: 'number',
            message: undefined,
          },
        ]);
        expect(validationErrorsToMessages(resultError1)).toStrictEqual([
          'Expected <number> at month, got <string> type value "ab".',
        ]);
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

  describe('partially partial', () => {
    const ymdBase = record({
      year: number(1900),
      month: number(1),
      date: number(1),
    });

    const ymd = partial(ymdBase, { keysToBeOptional: ['month', 'date'] });

    type Ymd = TypeOf<typeof ymd>;

    expectType<Ymd, Readonly<{ year: number; month?: number; date?: number }>>(
      '=',
    );

    expectType<typeof ymd.defaultValue, Ymd>('=');

    describe('is', () => {
      test('truthy case', () => {
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

      test('falsy case 1', () => {
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

      test('falsy case 2', () => {
        const x: UnknownRecord = {
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
        };

        const result = ymd.validate(x);
        expectType<typeof result, Result<Ymd, readonly ValidationError[]>>('=');

        expect(Result.isOk(result)).toBe(true);

        const resultValue6 = Result.unwrapThrow(result);

        expect(resultValue6).toStrictEqual({
          year: 2000,
          month: 12,
        });
      });

      test('partiallyPartialType validate returns input as-is for OK cases', () => {
        const input: UnknownRecord = {
          year: 2000,
          month: 12,
        };
        const result = ymd.validate(input);

        expect(Result.isOk(result)).toBe(true);

        const resultValue7 = Result.unwrapThrow(result);

        expect(resultValue7).toBe(input); // ✅ same reference
      });

      test('falsy case', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        };

        const result = ymd.validate(x);

        expect(Result.isErr(result)).toBe(true);

        const resultError2 = Result.unwrapErrThrow(result);

        expect(resultError2).toStrictEqual([
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
        expect(validationErrorsToMessages(resultError2)).toStrictEqual([
          'Expected <number> at month, got <string> type value "ab".',
          'Expected <number> at date, got <string> type value "cd".',
        ]);
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
});
