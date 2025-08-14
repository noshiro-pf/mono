import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../validation-error.mjs';
import { optional } from './optional.mjs';
import { record } from './record.mjs';

describe('record', () => {
  const ymd = record({
    year: number(1900),
    month: number(1),
    date: number(1),
  });

  expectType<
    typeof ymd,
    Type<Readonly<{ year: number; month: number; date: number }>>
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

      if (Result.isOk(result)) {
        expectType<typeof result.value, Ymd>('=');
        expect(result.value).toStrictEqual({
          year: 2000,
          month: 12,
          date: 25,
        });
      }
    });

    test('falsy case 1', () => {
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
          'Expected number at month, got string',
          'Expected number at date, got string',
        ]);
      }
    });

    test('falsy case 2', () => {
      const x: UnknownRecord = {
        year: 2000,
      };

      const result = ymd.validate(x);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: ['month'],
            actualValue: { year: 2000 },
            typeName: '{ year: number, month: number, date: number }',
            expectedType: '{ year: number, month: number, date: number }',
            message: 'Missing required key "month"',
          },
          {
            path: ['date'],
            actualValue: { year: 2000 },
            typeName: '{ year: number, month: number, date: number }',
            expectedType: '{ year: number, month: number, date: number }',
            message: 'Missing required key "date"',
          },
        ]);
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'Missing required key "month" at month',
          'Missing required key "date" at date',
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

      if (Result.isOk(result)) {
        expectType<typeof result.value, Ymd>('=');
        expect(result.value).toStrictEqual({
          year: 2000,
          month: 12,
        });
      }
    });

    test('falsy case', () => {
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
          'Expected number at month, got string',
          'Expected number at date, got string',
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
