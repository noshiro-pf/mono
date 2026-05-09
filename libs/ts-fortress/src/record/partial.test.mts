import { expectType, Result } from 'ts-data-forge';
import { type UnknownRecord } from 'ts-type-forge';
import { number } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { optional } from './optional.mjs';
import { partial } from './partial.mjs';
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
      Type<
        Readonly<
          Partial<Readonly<{ year: number; month: number; date: number }>>
        >
      >
    >('=');

    expectType<
      keyof typeof ymd,
      | 'typeName'
      | 'defaultValue'
      | 'is'
      | 'assertIs'
      | 'cast'
      | 'fill'
      | 'validate'
      | 'optional'
    >('=');

    type Ymd = TypeOf<typeof ymd>;

    expectType<
      Ymd,
      Partial<Readonly<{ year: number; month: number; date: number }>>
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

      test('falsy case', () => {
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
            year: number(1900),
            month: optional(number(1)),
            date: optional(number(1)),
          },
          { excessProperty: 'reject' },
        );

        const ymdReject = partial(ymdBaseReject);

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
            year: number(1900),
            month: optional(number(1)),
            date: optional(number(1)),
          },
          { excessProperty: 'reject' },
        );

        const ymdReject = partial(ymdBaseReject);

        const input: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 25,
        } as const;

        const result = ymdReject.validate(input);

        assert.isTrue(Result.isOk(result));

        expect(Result.unwrapThrow(result)).toBe(input); // ✅ same reference
      });

      test('truthy case optional keys', () => {
        const x: UnknownRecord = {} as const;

        const result = ymd.validate(x);

        expectType<typeof result, Result<Ymd, readonly ValidationError[]>>('=');

        assert.isTrue(Result.isOk(result));

        const resultValue2 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue2, {});
      });

      test('validate returns input as-is for empty object', () => {
        const input: UnknownRecord = {} as const;

        const result = ymd.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue3 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue3, input); // Deep equality

        // In allow mode (default), same reference is returned
        expect(resultValue3).toBe(input); // Same reference
      });

      test('validate accepts empty object when excessProperty is "reject" (all fields optional, no excess)', () => {
        const ymdBaseReject = record(
          {
            year: number(1900),
            month: optional(number(1)),
            date: optional(number(1)),
          },
          { excessProperty: 'reject' },
        );

        const ymdReject = partial(ymdBaseReject);

        const input: UnknownRecord = {} as const;

        const result = ymdReject.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue3 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue3, input); // Deep equality

        expect(resultValue3).toBe(input); // ✅ same reference
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

        const resultValue4 = Result.unwrapThrow(result);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        assert.deepStrictEqual(resultValue4 as UnknownRecord, {
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

        const resultValue5 = Result.unwrapThrow(result);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        assert.deepStrictEqual(resultValue5 as UnknownRecord, {
          year: 2000,
          month: 12,
          date: 25,
          aaa: 999,
        });

        // In allow mode (default), excess properties are kept → same reference
        expect(resultValue5).toBe(input);
      });

      test('falsy case 1', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        } as const;

        const result = ymd.validate(x);

        assert.isTrue(Result.isErr(result));

        const resultError = Result.unwrapErrThrow(result);

        assert.deepStrictEqual(resultError, [
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

        assert.deepStrictEqual(validationErrorsToMessages(resultError), [
          'Error at month: expected <number> type but <string> type value "ab" was passed.',
          'Error at date: expected <number> type but <string> type value "cd" was passed.',
        ]);
      });

      test('falsy case 2', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
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
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError1), [
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

    expectType<typeof ymd.defaultValue, TypeOf<typeof ymd>>('=');

    describe('is', () => {
      test('truthy case', () => {
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

      test('falsy case 1', () => {
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

      test('falsy case 2', () => {
        const x: UnknownRecord = {
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
        } as const;

        const result = ymd.validate(x);

        expectType<typeof result, Result<Ymd, readonly ValidationError[]>>('=');

        assert.isTrue(Result.isOk(result));

        const resultValue6 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue6, {
          year: 2000,
          month: 12,
        });
      });

      test('partiallyPartialType validate returns input as-is for OK cases', () => {
        const input: UnknownRecord = {
          year: 2000,
          month: 12,
        } as const;

        const result = ymd.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue7 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue7, input); // Deep equality

        // In allow mode (default), same reference is returned
        expect(resultValue7).toBe(input); // Same reference
      });

      test('partiallyPartialType validate rejects excess properties when excessProperty is "reject"', () => {
        const ymdBaseReject = record(
          {
            year: number(1900),
            month: number(1),
            date: number(1),
          },
          { excessProperty: 'reject' },
        );

        const ymdReject = partial(ymdBaseReject, {
          keysToBeOptional: ['month', 'date'],
        });

        const input: UnknownRecord = {
          year: 2000,
          month: 12,
          extra: 'not allowed',
        } as const;

        const result = ymdReject.validate(input);

        assert.isTrue(Result.isErr(result));
      });

      test('partiallyPartialType validate accepts valid data without excess when excessProperty is "reject"', () => {
        const ymdBaseReject = record(
          {
            year: number(1900),
            month: number(1),
            date: number(1),
          },
          { excessProperty: 'reject' },
        );

        const ymdReject = partial(ymdBaseReject, {
          keysToBeOptional: ['month', 'date'],
        });

        const input: UnknownRecord = {
          year: 2000,
          month: 12,
        } as const;

        const result = ymdReject.validate(input);

        assert.isTrue(Result.isOk(result));

        expect(Result.unwrapThrow(result)).toBe(input); // ✅ same reference
      });

      test('falsy case', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
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
          {
            path: ['date'],
            actualValue: 'cd',
            expectedType: 'number',
            typeName: 'number',
            details: undefined,
          },
        ]);

        assert.deepStrictEqual(validationErrorsToMessages(resultError2), [
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
});
