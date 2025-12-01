import { expectType, Result } from 'ts-data-forge';
import { number, string } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import {
  type ValidationError,
  validationErrorsToMessages,
} from '../utils/index.mjs';
import { keyValueRecord } from './key-value-record.mjs';

describe(keyValueRecord, () => {
  const strNumRecord = keyValueRecord(string(), number());

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

      assert.isTrue(strNumRecord.is(x));
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

      assert.isFalse(strNumRecord.is(x));
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

      const result = strNumRecord.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('falsy case', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 'ab',
        date: 'cd',
      };

      const result = strNumRecord.validate(x);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: 'ab',
          expectedType: 'key-value-record',
          typeName: 'key-value-record',
          details: {
            kind: 'record-entry',
            entry: 'value',
            expectedType: 'number',
          },
        },
        {
          path: ['month'],
          actualValue: 'ab',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
        {
          path: [],
          actualValue: 'cd',
          expectedType: 'key-value-record',
          typeName: 'key-value-record',
          details: {
            kind: 'record-entry',
            entry: 'value',
            expectedType: 'number',
          },
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
        'Error: expected record value to be <number> but <string> type value "ab" was passed.',
        'Error at month: expected <number> value but <string> type value "ab" was passed.',
        'Error: expected record value to be <number> but <string> type value "cd" was passed.',
        'Error at date: expected <number> value but <string> type value "cd" was passed.',
      ]);
    });
  });

  describe('fill', () => {
    test('from an empty record', () => {
      const x: UnknownRecord = {};

      assert.deepStrictEqual(strNumRecord.fill(x), {});
    });

    test('from a filled record', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 999,
        date: 999,
      };

      assert.deepStrictEqual(strNumRecord.fill(x), {
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

      assert.deepStrictEqual(strNumRecord.fill(x), {
        year: 2000,
      });
    });
  });
});
