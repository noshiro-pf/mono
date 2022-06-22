import { assertType } from '@noshiro/ts-utils';
import { number } from './primitives';
import { record } from './record';
import type { Typeof } from './type';

describe('record', () => {
  const ymd = record({
    year: number(1900),
    month: number(1),
    date: number(1),
  });

  type Ymd = Typeof<typeof ymd>;

  assertType<
    TypeEq<Ymd, Readonly<{ year: number; month: number; date: number }>>
  >();

  assertType<TypeEq<typeof ymd.defaultValue, Ymd>>();

  describe('validate', () => {
    test('truthy case', () => {
      const x: ReadonlyRecordBase = {
        year: 2000,
        month: 12,
        date: 12,
      };

      if (ymd.is(x)) {
        assertType<TypeEq<typeof x, Ymd>>();
      } else {
        assertType<TypeEq<typeof x, ReadonlyRecordBase>>();
      }

      expect(ymd.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: ReadonlyRecordBase = {
        year: 2000,
        month: 'ab',
        date: 'cd',
      };

      if (ymd.is(x)) {
        assertType<TypeEq<typeof x, Ymd>>();
      } else {
        assertType<TypeEq<typeof x, ReadonlyRecordBase>>();
      }

      expect(ymd.is(x)).toBe(false);
    });
  });

  describe('fill', () => {
    test('from an empty record', () => {
      const x: ReadonlyRecordBase = {};

      expect(ymd.fill(x)).toStrictEqual({
        year: 1900,
        month: 1,
        date: 1,
      });
    });

    test('from a filled record', () => {
      const x: ReadonlyRecordBase = {
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
      const x: ReadonlyRecordBase = {
        year: 2000,
      };

      expect(ymd.fill(x)).toStrictEqual({
        year: 2000,
        month: 1,
        date: 1,
      });
    });

    test('from a partial record with excess property', () => {
      const x: ReadonlyRecordBase = {
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
