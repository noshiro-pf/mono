import { expectType, Result } from 'ts-data-forge';
import { type UnknownRecord } from 'ts-type-forge';
import { number } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { optional } from './optional.mjs';
import { record } from './record.mjs';

describe(record, () => {
  const ymd = record({
    year: number(1900),
    month: number(1),
    date: number(1),
  });

  const ymdStrict = record(
    {
      year: number(1900),
      month: optional(number(1)),
      date: optional(number(1)),
    },
    { excessProperty: 'reject' },
  );

  expectType<
    typeof ymd,
    Type<Readonly<{ year: number; month: number; date: number }>>
  >('=');

  type Ymd = TypeOf<typeof ymd>;

  expectType<Ymd, Readonly<{ year: number; month: number; date: number }>>('=');

  expectType<typeof ymd.defaultValue, TypeOf<typeof ymd>>('=');

  // record(shape) and record(shape, { excessProperty: 'allow' }) produce the same type
  const _ymdExplicitAllow = record(
    {
      year: number(1900),
      month: number(1),
      date: number(1),
    },
    { excessProperty: 'allow' },
  );

  expectType<typeof ymd, typeof _ymdExplicitAllow>('=');

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

    test('validate returns input as-is (with excess) for OK cases since default excessProperty is "allow"', () => {
      const input = {
        year: 2023,
        month: 6,
        date: 15,
        extra: 'should be kept',
      } as const;

      const result = ymd.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      assert.deepStrictEqual(resultValue1 as UnknownRecord, {
        year: 2023,
        month: 6,
        date: 15,
        extra: 'should be kept',
      });

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('validate rejects excess properties if excessProperty is "reject"', () => {
      const input = {
        year: 2023,
        month: 6,
        extra: 'not allowed',
      } as const;

      const result = ymdStrict.validate(input);

      assert.isTrue(Result.isErr(result));
    });

    test('validate accepts valid data without excess when excessProperty is "reject"', () => {
      const input = {
        year: 2023,
        month: 6,
      } as const;

      const result = ymdStrict.validate(input);

      assert.isTrue(Result.isOk(result));

      expect(Result.unwrapThrow(result)).toBe(input); // ✅ same reference
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
  const ymd = record({
    year: number(1900),
    month: optional(number(1)),
    date: optional(number(1)),
  });

  const ymdStrict = record(
    {
      year: number(1900),
      month: optional(number(1)),
      date: optional(number(1)),
    },
    { excessProperty: 'reject' },
  );

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

    test('validate returns input as-is (with excess) for OK cases since default excessProperty is "allow"', () => {
      const input = {
        year: 2024,
        month: 8,
        extra: 'should be kept',
      } as const;

      const result = ymd.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue3 = Result.unwrapThrow(result);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      assert.deepStrictEqual(resultValue3 as UnknownRecord, {
        year: 2024,
        month: 8,
        extra: 'should be kept',
      });

      expect(resultValue3).toBe(input); // ✅ same reference
    });

    test('validate rejects excess properties if excessProperty is "reject"', () => {
      const input = {
        year: 2024,
        month: 8,
        extra: 'not allowed',
      } as const;

      const result = ymdStrict.validate(input);

      assert.isTrue(Result.isErr(result));
    });

    test('validate accepts valid data without excess when excessProperty is "reject"', () => {
      const input = {
        year: 2024,
        month: 8,
      } as const;

      const result = ymdStrict.validate(input);

      assert.isTrue(Result.isOk(result));

      expect(Result.unwrapThrow(result)).toBe(input); // ✅ same reference
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
