import { expectType, Result, toInt } from '@noshiro/ts-utils';
import { array } from './array/index.mjs';
import { int } from './branded/index.mjs';
import { uintRange } from './enum/index.mjs';
import { number } from './primitives/index.mjs';
import { optional, pick, record } from './record/index.mjs';
import { type TypeOf } from './type.mjs';
import { unknown } from './unknown.mjs';

describe('nested record', () => {
  const nestedRecord = record({
    xs: array(int(toInt(2))),
    rec: pick(
      record({
        a: uintRange({ start: 0, end: 11, defaultValue: 0 }),
        b: uintRange({ start: 0, end: 11, defaultValue: 0 }),
        c: optional(uintRange({ start: 3, end: 6, defaultValue: 3 })),
        d: unknown(),
      }),
      ['a', 'b', 'c'],
    ),
    meta: number(100),
    u: unknown(),
  });

  type NestedRecord = TypeOf<typeof nestedRecord>;

  expectType<
    NestedRecord,
    Readonly<{
      xs: readonly Int[];
      rec: Readonly<{
        a: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
        b: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
        c?: 3 | 4 | 5;
      }>;
      meta: number;
      u: unknown;
    }>
  >('=');

  expectType<typeof nestedRecord.defaultValue, NestedRecord>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: UnknownRecord = {
        xs: [1, 2, 3],
        rec: {
          a: 1,
          b: 2,
          c: 3,
        },
        meta: 3,
        u: undefined,
      };

      if (nestedRecord.is(x)) {
        expectType<typeof x, NestedRecord>('=');
      } else {
        expectType<typeof x, UnknownRecord>('=');
      }

      expect(nestedRecord.is(x)).toBe(true);
    });

    test('falsy case', () => {
      const x: UnknownRecord = {
        xs: [-1, 2.2, 3.3],
        rec: {
          a: 123,
          b: 234,
          c: 3,
        },
        meta: 345,
        u: undefined,
      };

      if (nestedRecord.is(x)) {
        expectType<typeof x, NestedRecord>('=');
      } else {
        expectType<typeof x, UnknownRecord>('=');
      }

      expect(nestedRecord.is(x)).toBe(false);
    });
  });

  describe('validate', () => {
    test('falsy case', () => {
      const x: UnknownRecord = {
        xs: [-1, 2.2, 3.3],
        rec: {
          a: 123,
          b: 234,
          c: 3,
        },
        meta: 345,
        u: undefined,
      };

      expect(nestedRecord.validate(x).value).toStrictEqual([
        `The value at record key "xs" is expected to be <(Finite & Int & not(NaNValue))[]>, but it is actually '[-1,2.2,3.3]'.`,
        `The array element is expected to be <Finite & Int & not(NaNValue)>, but the actual value at index 1 is '2.2'.`,
        `The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & not(NaNValue)>, but it is actually '2.2'.`,
      ]);
    });
  });

  describe('fill', () => {
    test('from an empty record', () => {
      const x: UnknownRecord = {};

      expect(nestedRecord.fill(x)).toStrictEqual({
        xs: [],
        rec: {
          a: 0,
          b: 0,
          c: 3,
        },
        meta: 100,
        u: undefined,
      });
    });

    test('from a filled record', () => {
      const x: UnknownRecord = {
        xs: [-1, 2.2, 3.3],
        rec: {
          a: 123,
          b: 234,
          c: 3,
        },
        meta: 345,
        u: undefined,
      };

      expect(nestedRecord.fill(x)).toStrictEqual({
        xs: [-1, 2, 2],
        rec: {
          a: 0,
          b: 0,
          c: 3,
        },
        meta: 345,
        u: undefined,
      });
    });

    test('from a partial record', () => {
      const x: UnknownRecord = {
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
          c: 3,
        },
        meta: 100,
        u: undefined,
      });
    });

    test('from a partial record with excess property', () => {
      const x: UnknownRecord = {
        xs: [11, 22],
        rec: {
          a: 3,
          d: 9988,
        },
        u: undefined,
        aaaaa: [9999],
      };

      expect(nestedRecord.fill(x)).toStrictEqual({
        xs: [11, 22],
        rec: {
          a: 3,
          b: 0,
          c: 3,
        },
        meta: 100,
        u: undefined,
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

      expectType<typeof x.month, number>('='); // no type error
    };

    expect(f).toThrow('The record is expected to have the key "month".');
  });

  test('validation function', () => {
    const x = {
      year: 2000,
    };

    const result = ymd.validate(x);

    expect(Result.isErr(result)).toBe(true);

    expect(result.value).toStrictEqual([
      'The record is expected to have the key "month".',
    ]);
  });
});

describe('ymd2', () => {
  const ymd2 = record({
    year: int(toInt(1900)),
    month: uintRange({
      defaultValue: 1,
      start: 1,
      end: 13,
    }),
    date: uintRange({
      defaultValue: 1,
      start: 1,
      end: 32,
    }),
  });

  type YMD2 = TypeOf<typeof ymd2>;

  expectType<YMD2['month'], 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12>(
    '=',
  );

  test('is', () => {
    const x = {
      year: 2000,
    };

    expect(ymd2.is(x)).toBe(false);
  });
});
