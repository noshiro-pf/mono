import { assertType } from '@noshiro/ts-utils';
import { number, string } from '../primitives';
import type { TypeOf } from '../type';
import { keyValueRecord } from './key-value-record';

describe('keyValueRecord', () => {
  const strNumRecord = keyValueRecord({
    keyType: string(''),
    valueType: number(0),
  });

  type StrNumRecord = TypeOf<typeof strNumRecord>;

  assertType<TypeEq<StrNumRecord, Readonly<Record<string, number>>>>();

  assertType<TypeEq<typeof strNumRecord.defaultValue, StrNumRecord>>();

  describe('is', () => {
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

  describe('validate', () => {
    test('falsy case', () => {
      const x: ReadonlyRecordBase = {
        year: 2000,
        month: 'ab',
        date: 'cd',
      };

      expect(strNumRecord.validate(x).value).toStrictEqual([
        `The value of the record is expected to be <number>, but it is actually '"ab"'.`,
        `The value is expected to be <number>, but it is actually '"ab"'.`,
      ]);
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
