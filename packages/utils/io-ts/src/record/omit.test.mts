import { expectType } from '@noshiro/ts-utils';
import { number } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import { omit } from './omit.mjs';
import { record } from './record.mjs';

describe('omit', () => {
  const ym = omit(
    record({
      year: number(1900),
      month: number(1),
      date: number(1),
    }),
    ['date'],
  );

  expectType<typeof ym, Type<Readonly<{ year: number; month: number }>>>('=');

  type Ym = TypeOf<typeof ym>;

  expectType<Ym, Readonly<{ year: number; month: number }>>('=');

  expectType<typeof ym.defaultValue, Ym>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 12,
      };

      if (ym.is(x)) {
        expectType<typeof x, Ym>('=');
      } else {
        expectType<typeof x, UnknownRecord>('=');
      }

      expect(ym.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 'ab',
      };

      if (ym.is(x)) {
        expectType<typeof x, Ym>('=');
      } else {
        expectType<typeof x, UnknownRecord>('=');
      }

      expect(ym.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('falsy case', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 'ab',
      };

      expect(ym.validate(x).value).toStrictEqual([
        `The value at record key "month" is expected to be <number>, but it is actually '"ab"'.`,
        `The value is expected to be <number>, but it is actually '"ab"'.`,
      ]);
    });
  });

  describe('fill', () => {
    test('from an empty record', () => {
      const x: UnknownRecord = {};

      expect(ym.fill(x)).toStrictEqual({
        year: 1900,
        month: 1,
      });
    });

    test('from a filled record', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 999,
      };

      expect(ym.fill(x)).toStrictEqual({
        year: 2000,
        month: 999,
      });
    });

    test('from a partial record', () => {
      const x: UnknownRecord = {
        year: 2000,
      };

      expect(ym.fill(x)).toStrictEqual({
        year: 2000,
        month: 1,
      });
    });

    test('from a partial record with excess property', () => {
      const x: UnknownRecord = {
        year: 2000,
        aaaaa: 9999,
      };

      expect(ym.fill(x)).toStrictEqual({
        year: 2000,
        month: 1,
      });
    });
  });
});
