import { expectType } from '@noshiro/ts-utils';
import { describe, expect, test } from 'vitest';
import { number, string } from '../primitives/index.mjs';
import { type TypeOf } from '../type.mjs';
import { keyValueRecord } from './key-value-record.mjs';

describe('keyValueRecord', () => {
  const strNumRecord = keyValueRecord(string(''), number(0));

  type StrNumRecord = TypeOf<typeof strNumRecord>;

  expectType<StrNumRecord, Record<string, number>>('=');

  expectType<typeof strNumRecord.defaultValue, StrNumRecord>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: RecordBase = {
        year: 2000,
        month: 12,
        date: 12,
      };

      if (strNumRecord.is(x)) {
        expectType<typeof x, StrNumRecord>('=');
      } else {
        expectType<typeof x, RecordBase>('=');
      }

      expect(strNumRecord.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: RecordBase = {
        year: 2000,
        month: 'ab',
        date: 'cd',
      };

      if (strNumRecord.is(x)) {
        expectType<typeof x, StrNumRecord>('=');
      } else {
        expectType<typeof x, RecordBase>('=');
      }

      expect(strNumRecord.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('falsy case', () => {
      const x: RecordBase = {
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
      const x: RecordBase = {};

      expect(strNumRecord.fill(x)).toStrictEqual({});
    });

    test('from a filled record', () => {
      const x: RecordBase = {
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
      const x: RecordBase = {
        year: 2000,
        month: '12',
      };

      expect(strNumRecord.fill(x)).toStrictEqual({
        year: 2000,
      });
    });
  });
});
