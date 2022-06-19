import { assertType } from '@noshiro/ts-utils';
import { array } from './array';
import { int, uintRange } from './numbers';
import { number } from './primitives';
import { record } from './record';
import type { Typeof } from './type';

describe('nested record', () => {
  const nestedRecord = record({
    xs: array({ elementType: int(2) }),
    rec: record({
      a: uintRange(0, 10, 0),
      b: uintRange(0, 10, 0),
    }),
    meta: number(100),
  });

  type NestedRecord = Typeof<typeof nestedRecord>;

  type D = typeof nestedRecord.defaultValue;

  assertType<
    TypeEq<
      NestedRecord,
      Readonly<{
        xs: readonly number[];
        rec: Readonly<{
          a: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
          b: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
        }>;
        meta: number;
      }>
    >
  >();

  assertType<
    TypeEq<
      D,
      Readonly<{
        xs: readonly number[];
        rec: Readonly<{
          a: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
          b: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
        }>;
        meta: 100;
      }>
    >
  >();

  describe('validate', () => {
    test('truthy case', () => {
      const x: ReadonlyRecordBase = {
        xs: [1, 2, 3],
        rec: {
          a: 1,
          b: 2,
        },
        meta: 3,
      };

      if (nestedRecord.is(x)) {
        assertType<
          TypeEq<
            typeof x,
            Readonly<{
              xs: readonly number[];
              rec: Readonly<{
                a: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
                b: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
              }>;
              meta: number;
            }>
          >
        >();
      } else {
        assertType<TypeEq<typeof x, ReadonlyRecordBase>>();
      }

      expect(nestedRecord.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: ReadonlyRecordBase = {
        xs: [-1, 2.2, 3.3],
        rec: {
          a: 123,
          b: 234,
        },
        meta: 345,
      };

      if (nestedRecord.is(x)) {
        assertType<
          TypeEq<
            typeof x,
            Readonly<{
              xs: readonly number[];
              rec: Readonly<{
                a: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
                b: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
              }>;
              meta: number;
            }>
          >
        >();
      } else {
        assertType<TypeEq<typeof x, ReadonlyRecordBase>>();
      }

      expect(nestedRecord.is(x)).toBe(false);
    });
  });

  describe('fill', () => {
    test('from an empty record', () => {
      const x: ReadonlyRecordBase = {};

      expect(nestedRecord.fill(x)).toStrictEqual({
        xs: [],
        rec: {
          a: 0,
          b: 0,
        },
        meta: 100,
      });
    });

    test('from a filled record', () => {
      const x: ReadonlyRecordBase = {
        xs: [-1, 2.2, 3.3],
        rec: {
          a: 123,
          b: 234,
        },
        meta: 345,
      };

      expect(nestedRecord.fill(x)).toStrictEqual({
        xs: [-1, 2, 2],
        rec: {
          a: 0,
          b: 0,
        },
        meta: 345,
      });
    });

    test('from a partial record', () => {
      const x: ReadonlyRecordBase = {
        xs: [11, 22],
        rec: {
          a: 3,
        },
      };

      expect(nestedRecord.fill(x)).toStrictEqual({
        xs: [11, 22],
        rec: {
          a: 3,
          b: 0,
        },
        meta: 100,
      });
    });

    test('from a partial record with excess property', () => {
      const x: ReadonlyRecordBase = {
        xs: [11, 22],
        rec: {
          a: 3,
          c: 9988,
        },
        aaaaa: [9999],
      };

      expect(nestedRecord.fill(x)).toStrictEqual({
        xs: [11, 22],
        rec: {
          a: 3,
          b: 0,
        },
        meta: 100,
      });
    });
  });
});
