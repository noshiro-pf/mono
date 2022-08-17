import { assertType, Result } from '@noshiro/ts-utils';
import { array } from './array';
import { int, positiveInteger, uintRange } from './numbers';
import { number } from './primitives';
import { record } from './record';
import type { TypeOf } from './type';

describe('nested record', () => {
  const nestedRecord = record({
    xs: array({ elementType: int(2) }),
    rec: record({
      a: uintRange({ min: 0, max: 10, defaultValue: 0 }),
      b: uintRange({ min: 0, max: 10, defaultValue: 0 }),
    }),
    meta: number(100),
  });

  type NestedRecord = TypeOf<typeof nestedRecord>;

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

  assertType<TypeEq<typeof nestedRecord.defaultValue, NestedRecord>>();

  describe('is', () => {
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
        assertType<TypeEq<typeof x, NestedRecord>>();
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
        assertType<TypeEq<typeof x, NestedRecord>>();
      } else {
        assertType<TypeEq<typeof x, ReadonlyRecordBase>>();
      }

      expect(nestedRecord.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('falsy case', () => {
      const x: ReadonlyRecordBase = {
        xs: [-1, 2.2, 3.3],
        rec: {
          a: 123,
          b: 234,
        },
        meta: 345,
      };

      expect(nestedRecord.validate(x).value).toStrictEqual([
        `The value at record key "xs" is expected to be <int[]>, but it is actually '[-1,2.2,3.3]'.`,
        `The array element is expected to be <int>, but the actual value at index 1 is '2.2'.`,
        `The value is expected to be <int>, but it is actually '2.2'.`,
      ]);
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

describe('ymd', () => {
  const ymd = record({
    year: number(1900),
    month: number(1),
    date: number(1),
  });

  test('is', () => {
    const x = {
      year: 2000,
    };

    expect(ymd.is(x)).toBe(false);
  });

  test('fill', () => {
    const x = {
      year: 2000,
    };

    expect(ymd.fill(x)).toStrictEqual({
      year: 2000,
      month: 1,
      date: 1,
    });
  });

  test('assertion function', () => {
    type YMD = TypeOf<typeof ymd>;

    const assertIsYmd: (a: unknown) => asserts a is YMD = ymd.assertIs;

    const x = {
      year: 2000,
    };

    const f = (): void => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      x.month;

      assertIsYmd(x); // throws an error

      assertType<TypeEq<typeof x.month, number>>(); // no type error
    };

    expect(f).toThrow('The record is expected to have key "month".');
  });

  test('validation function', () => {
    const x = {
      year: 2000,
    };

    const result = ymd.validate(x);

    expect(Result.isErr(result)).toBe(true);

    expect(result.value).toStrictEqual([
      'The record is expected to have key "month".',
    ]);
  });
});

describe('ymd2', () => {
  const ymd2 = record({
    year: positiveInteger(1900),
    month: uintRange({
      defaultValue: 1,
      min: 1,
      max: 12,
    }),
    date: uintRange({
      defaultValue: 1,
      min: 1,
      max: 31,
    }),
  });

  type YMD2 = TypeOf<typeof ymd2>;

  assertType<
    TypeEq<YMD2['month'], 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>
  >();

  test('is', () => {
    const x = {
      year: 2000,
    };

    expect(ymd2.is(x)).toBe(false);
  });
});
