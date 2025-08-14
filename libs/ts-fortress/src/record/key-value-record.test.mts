import { expectType, Result } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../validation-error.mjs';
import { keyValueRecord } from './key-value-record.mjs';

describe('keyValueRecord', () => {
  const strNumRecord = keyValueRecord(string(''), number(0));

  type StrNumRecord = TypeOf<typeof strNumRecord>;

  expectType<StrNumRecord, ReadonlyRecord<string, number>>('=');

  expectType<typeof strNumRecord.defaultValue, StrNumRecord>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 12,
        date: 12,
      };

      if (strNumRecord.is(x)) {
        expectType<typeof x, StrNumRecord>('=');
      } else {
        expectType<typeof x, UnknownRecord>('=');
      }

      expect(strNumRecord.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 'ab',
        date: 'cd',
      };

      if (strNumRecord.is(x)) {
        expectType<typeof x, StrNumRecord>('=');
      } else {
        expectType<typeof x, UnknownRecord>('=');
      }

      expect(strNumRecord.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 12,
        date: 25,
      };

      const result = strNumRecord.validate(x);
      expectType<
        typeof result,
        Result<StrNumRecord, readonly ValidationError[]>
      >('=');
      expect(Result.isOk(result)).toBe(true);

      if (Result.isOk(result)) {
        expect(result.value).toStrictEqual({
          year: 2000,
          month: 12,
          date: 25,
        });
      }
    });

    test('falsy case', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 'ab',
        date: 'cd',
      };

      const result = strNumRecord.validate(x);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 'ab',
            expectedType: 'key-value-record',
            typeName: 'key-value-record',
            message: 'The value of the record is expected to be <number>',
          },
          {
            path: ['month'],
            actualValue: 'ab',
            expectedType: 'number',
            typeName: 'number',
            message: undefined,
          },
          {
            path: [],
            actualValue: 'cd',
            expectedType: 'key-value-record',
            typeName: 'key-value-record',
            message: 'The value of the record is expected to be <number>',
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
          'The value of the record is expected to be <number>',
          'Expected number at month, got string',
          'The value of the record is expected to be <number>',
          'Expected number at date, got string',
        ]);
      }
    });
  });

  describe('fill', () => {
    test('from an empty record', () => {
      const x: UnknownRecord = {};

      expect(strNumRecord.fill(x)).toStrictEqual({});
    });

    test('from a filled record', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 999,
        date: 999,
      };

      expect(strNumRecord.fill(x)).toStrictEqual({
        year: 2000,
        month: 999,
        date: 999,
      });
    });

    test('from a record with wrong value', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: '12',
      };

      expect(strNumRecord.fill(x)).toStrictEqual({
        year: 2000,
      });
    });
  });
});
