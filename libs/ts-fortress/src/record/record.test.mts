import { expectType, Result } from 'ts-data-forge';
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

  expectType<
    typeof ymd,
    Type<Readonly<{ year: number; month: number; date: number }>> &
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

  expectType<Ymd, Readonly<{ year: number; month: number; date: number }>>('=');

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

      expect(Result.isOk(result)).toBe(true);

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
      };

      const result = ymd.validate(x);

      expect(Result.isErr(result)).toBe(true);

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
        'Expected <number> at month, got <string> type value "ab".',
        'Expected <number> at date, got <string> type value "cd".',
      ]);
    });

    test('falsy case 2', () => {
      const x: UnknownRecord = {
        year: 2000,
      };

      const result = ymd.validate(x);

      expect(Result.isErr(result)).toBe(true);

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
        'Missing required key "month" at month',
        'Missing required key "date" at date',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = {
        year: 2023,
        month: 6,
        date: 15,
      };
      const result = ymd.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
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

describe('partial record', () => {
  const ymd = record({
    year: number(1900),
    month: optional(number(1)),
    date: optional(number(1)),
  });

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

      expect(Result.isOk(result)).toBe(true);

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
        {
          path: ['date'],
          actualValue: 'cd',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError2), [
        'Expected <number> at month, got <string> type value "ab".',
        'Expected <number> at date, got <string> type value "cd".',
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = {
        year: 2024,
        month: 8,
      };
      const result = ymd.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue3 = Result.unwrapThrow(result);

      expect(resultValue3).toBe(input); // ✅ same reference
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
