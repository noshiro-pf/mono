import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { optional } from './optional.mjs';
import { record } from './record.mjs';

describe(record, () => {
  const ymd = record(
    {
      year: number(1900),
      month: number(1),
      date: number(1),
    },
    { excessPropertyValidation: 'strip' },
  );

  const ymdEased = record(
    {
      year: number(1900),
      month: optional(number(1)),
      date: optional(number(1)),
    },
    { excessPropertyValidation: 'allow' },
  );

  expectType<
    typeof ymd,
    Type<Readonly<{ year: number; month: number; date: number }>> &
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

  expectType<Ymd, Readonly<{ year: number; month: number; date: number }>>('=');

  expectType<typeof ymd.defaultValue, Ymd>('=');

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

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expectType<typeof resultValue, Ymd>('=');

      assert.deepStrictEqual(resultValue, {
        year: 2000,
        month: 12,
        date: 25,
      });
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
      } as const;

      const result = ymd.validate(x);

      assert.isTrue(Result.isErr(result));

      const resultError1 = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError1, [
        {
          path: ['month'],
          actualValue: { year: 2000 },
          typeName: '{ year: number, month: number, date: number }',
          expectedType: '{ year: number, month: number, date: number }',
          details: {
            kind: 'missing-key',
            key: 'month',
          },
        },
        {
          path: ['date'],
          actualValue: { year: 2000 },
          typeName: '{ year: number, month: number, date: number }',
          expectedType: '{ year: number, month: number, date: number }',
          details: {
            kind: 'missing-key',
            key: 'date',
          },
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError1), [
        'Error at month: missing required key "month".',
        'Error at date: missing required key "date".',
      ]);
    });

    test('validate returns the stripped content of input for OK cases if excessPropertyValidation is "strip"', () => {
      const input = {
        year: 2023,
        month: 6,
        date: 15,
        extra: 'should be stripped',
      } as const;

      const result = ymd.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue1, {
        year: 2023,
        month: 6,
        date: 15,
      });

      expect(resultValue1).not.toBe(input); // ✅ different reference
    });

    test('validate returns input as-is for OK cases if excessPropertyValidation is "allow"', () => {
      const input = {
        year: 2023,
        month: 6,
        date: 15,
      } as const;

      const result = ymdEased.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
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

describe('partial record', () => {
  const ymd = record(
    {
      year: number(1900),
      month: optional(number(1)),
      date: optional(number(1)),
    },
    { excessPropertyValidation: 'strip' },
  );

  const ymdEased = record(
    {
      year: number(1900),
      month: optional(number(1)),
      date: optional(number(1)),
    },
    { excessPropertyValidation: 'allow' },
  );

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

      assert.isTrue(Result.isOk(result));

      const resultValue2 = Result.unwrapThrow(result);

      expectType<typeof resultValue2, Ymd>('=');

      assert.deepStrictEqual(resultValue2, {
        year: 2000,
        month: 12,
      });
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

    test('validate returns the stripped content of input for OK cases if excessPropertyValidation is "strip"', () => {
      const input = {
        year: 2024,
        month: 8,
        extra: 'should be stripped',
      } as const;

      const result = ymd.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue3 = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue3, {
        year: 2024,
        month: 8,
      });

      expect(resultValue3).not.toBe(input); // ✅ different reference
    });

    test('validate returns input as-is for OK cases if excessPropertyValidation is "allow"', () => {
      const input = {
        year: 2024,
        month: 8,
      } as const;

      const result = ymdEased.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue3 = Result.unwrapThrow(result);

      expect(resultValue3).toBe(input); // ✅ same reference
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
