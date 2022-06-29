import { assertType } from '@noshiro/ts-utils';
import { keyValueRecord } from './key-value-record';
import { number, string } from './primitives';
import type { Typeof } from './type';

describe('keyValueRecord', () => {
  const strNumRecord = keyValueRecord({
    keyType: string(''),
    valueType: number(0),
  });

  type StrNumRecord = Typeof<typeof strNumRecord>;

  assertType<TypeEq<StrNumRecord, Readonly<Record<string, number>>>>();

  assertType<TypeEq<typeof strNumRecord.defaultValue, StrNumRecord>>();

  describe('validate', () => {
    test('truthy case', () => {
      const x: ReadonlyRecordBase = {
        year: 2000,
        month: 12,
        date: 12,
      };

      if (strNumRecord.is(x)) {
        assertType<TypeEq<typeof x, StrNumRecord>>();
      } else {
        assertType<TypeEq<typeof x, ReadonlyRecordBase>>();
      }

      expect(strNumRecord.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: ReadonlyRecordBase = {
        year: 2000,
        month: 'ab',
        date: 'cd',
      };

      if (strNumRecord.is(x)) {
        assertType<TypeEq<typeof x, StrNumRecord>>();
      } else {
        assertType<TypeEq<typeof x, ReadonlyRecordBase>>();
      }

      expect(strNumRecord.is(x)).toBe(false);
    });
  });

  describe('fill', () => {
    test('from an empty record', () => {
      const x: ReadonlyRecordBase = {};

      expect(strNumRecord.fill(x)).toStrictEqual({});
    });

    test('from a filled record', () => {
      const x: ReadonlyRecordBase = {
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
      const x: ReadonlyRecordBase = {
        year: 2000,
        month: '12',
      };

      expect(strNumRecord.fill(x)).toStrictEqual({
        year: 2000,
      });
    });
  });
});
