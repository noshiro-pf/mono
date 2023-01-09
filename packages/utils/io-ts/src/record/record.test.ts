import { assertType } from '@noshiro/ts-utils';
import { number } from '../primitives';
import type { TypeOf } from '../type';
import { record } from './record';

describe('record', () => {
  const ymd = record({
    year: number(1900),
    month: number(1),
    date: number(1),
  });

  type Ymd = TypeOf<typeof ymd>;

  assertType<
    TypeEq<Ymd, Readonly<{ year: number; month: number; date: number }>>
  >();

  assertType<TypeEq<typeof ymd.defaultValue, Ymd>>();

  describe('is', () => {
    test('truthy case', () => {
      const x: RecordBase = {
        year: 2000,
        month: 12,
        date: 12,
      };

      if (ymd.is(x)) {
        assertType<TypeEq<typeof x, Ymd>>();
      } else {
        assertType<TypeEq<typeof x, RecordBase>>();
      }

      expect(ymd.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: RecordBase = {
        year: 2000,
        month: 'ab',
        date: 'cd',
      };

      if (ymd.is(x)) {
        assertType<TypeEq<typeof x, Ymd>>();
      } else {
        assertType<TypeEq<typeof x, RecordBase>>();
      }

      expect(ymd.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('falsy case', () => {
      const x: RecordBase = {
        year: 2000,
        month: 'ab',
        date: 'cd',
      };

      expect(ymd.validate(x).value).toStrictEqual([
        `The value at record key "month" is expected to be <number>, but it is actually '"ab"'.`,
        `The value is expected to be <number>, but it is actually '"ab"'.`,
      ]);
    });
  });

  describe('fill', () => {
    test('from an empty record', () => {
      const x: RecordBase = {};

      expect(ymd.fill(x)).toStrictEqual({
        year: 1900,
        month: 1,
        date: 1,
      });
    });

    test('from a filled record', () => {
      const x: RecordBase = {
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
      const x: RecordBase = {
        year: 2000,
      };

      expect(ymd.fill(x)).toStrictEqual({
        year: 2000,
        month: 1,
        date: 1,
      });
    });

    test('from a partial record with excess property', () => {
      const x: RecordBase = {
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
