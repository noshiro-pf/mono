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
          excessPropertyValidation: 'strip';
          excessPropertyFill: 'allow' | 'strip';
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

        assert.isTrue(ymd.is(x));
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

        assert.isFalse(ymd.is(x));
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
        };

        const result = ymd.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue1 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue1, input); // Deep equality

        // In strip mode (default), a new object is created even without excess properties
        expect(resultValue1).not.toBe(input); // Different reference
      });

      test('validate returns input as-is for OK cases (allow mode)', () => {
        const ymdBaseAllow = record(
          {
            year: number(1900),
            month: optional(number(1)),
            date: optional(number(1)),
          },
          { excessPropertyValidation: 'allow' },
        );

        const ymdAllow = partial(ymdBaseAllow);

        const input: UnknownRecord = {
          year: 2000,
          month: 12,
          date: 25,
        };

        const result = ymdAllow.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue1 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue1, input); // Deep equality

        // In allow mode, the same reference is returned
        expect(resultValue1).toBe(input); // Same reference
      });

      test('truthy case optional keys', () => {
        const x: UnknownRecord = {};

        const result = ymd.validate(x);

        expectType<typeof result, Result<Ymd, readonly ValidationError[]>>('=');

        assert.isTrue(Result.isOk(result));

        const resultValue2 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue2, {});
      });

      test('validate returns input as-is for empty object', () => {
        const input: UnknownRecord = {};

        const result = ymd.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue3 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue3, input); // Deep equality

        // In strip mode (default), a new object is created even without excess properties
        expect(resultValue3).not.toBe(input); // Different reference
      });

      test('validate returns input as-is for empty object (allow mode)', () => {
        const ymdBaseAllow = record(
          {
            year: number(1900),
            month: optional(number(1)),
            date: optional(number(1)),
          },
          { excessPropertyValidation: 'allow' },
        );

        const ymdAllow = partial(ymdBaseAllow);

        const input: UnknownRecord = {};

        const result = ymdAllow.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue3 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue3, input); // Deep equality

        // In allow mode, the same reference is returned
        expect(resultValue3).toBe(input); // Same reference
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

        assert.isTrue(Result.isOk(result));

        const resultValue4 = Result.unwrapThrow(result);

        assert.deepStrictEqual(
          resultValue4,
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

        assert.isTrue(Result.isOk(result));

        const resultValue5 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue5, {
          year: 2000,
          month: 12,
          date: 25,
        });

        expect(resultValue5).not.toBe(input); // Different reference
      });

      test('falsy case 1', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        };

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
        };

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

        assert.isTrue(ymd.is(x));
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

        assert.isFalse(ymd.is(x));
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

        assert.isFalse(ymd.is(x));
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
        };

        const result = ymd.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue7 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue7, input); // Deep equality

        // In strip mode (default), a new object is created even without excess properties
        expect(resultValue7).not.toBe(input); // Different reference
      });

      test('partiallyPartialType validate returns input as-is for OK cases (allow mode)', () => {
        const ymdBaseAllow = record(
          {
            year: number(1900),
            month: number(1),
            date: number(1),
          },
          { excessPropertyValidation: 'allow' },
        );

        const ymdAllow = partial(ymdBaseAllow, {
          keysToBeOptional: ['month', 'date'],
        });

        const input: UnknownRecord = {
          year: 2000,
          month: 12,
        };

        const result = ymdAllow.validate(input);

        assert.isTrue(Result.isOk(result));

        const resultValue7 = Result.unwrapThrow(result);

        assert.deepStrictEqual(resultValue7, input); // Deep equality

        // In allow mode, the same reference is returned
        expect(resultValue7).toBe(input); // Same reference
      });

      test('falsy case', () => {
        const x: UnknownRecord = {
          year: 2000,
          month: 'ab',
          date: 'cd',
        };

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
});
