import { asInt, expectType, Result } from 'ts-data-forge';
import { array } from './array/index.mjs';
import { int } from './branded/index.mjs';
import { union } from './compose/index.mjs';
import { uintRange } from './enum/index.mjs';
import { nullType, number, undefinedType } from './primitives/index.mjs';
import { keyof, optional, partial, pick, record } from './record/index.mjs';
import { type TypeOf } from './type.mjs';
import { unknown } from './unknown.mjs';
import { validationErrorsToMessages } from './validation-error.mjs';

describe('nested record', () => {
  const nestedRecord = record({
    xs: array(int(asInt(2))),
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

      const result = nestedRecord.validate(x);
      expect(Result.isErr(result)).toBe(true);

      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: ['xs', '1'],
            actualValue: 2.2,
            expectedType: 'Finite & Int & not(NaNValue)',
            typeName: 'Finite & Int & not(NaNValue)',
            message:
              'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & not(NaNValue)>',
          },
          {
            path: ['xs', '2'],
            actualValue: 3.3,
            expectedType: 'Finite & Int & not(NaNValue)',
            typeName: 'Finite & Int & not(NaNValue)',
            message:
              'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & not(NaNValue)>',
          },
          {
            path: ['rec', 'a'],
            actualValue: 123,
            expectedType: 'uintRange(0, 11)',
            typeName: 'uintRange(0, 11)',
            message: 'The value is expected to be an integer between 0 and 10',
          },
          {
            path: ['rec', 'b'],
            actualValue: 234,
            expectedType: 'uintRange(0, 11)',
            typeName: 'uintRange(0, 11)',
            message: 'The value is expected to be an integer between 0 and 10',
          },
        ]);
        expect(validationErrorsToMessages(result.value)).toStrictEqual([
          'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & not(NaNValue)> at xs.1',
          'The value must satisfy the constraint corresponding to the brand keys: <Finite & Int & not(NaNValue)> at xs.2',
          'The value is expected to be an integer between 0 and 10 at rec.a',
          'The value is expected to be an integer between 0 and 10 at rec.b',
        ]);
      }
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

    expect(f).toThrow(
      '\nMissing required key "month" at month,\nMissing required key "date" at date',
    );
  });

  test('validation function', () => {
    const x = {
      year: 2000,
    };

    const result = ymd.validate(x);

    expect(Result.isErr(result)).toBe(true);

    if (Result.isErr(result)) {
      expect(result.value).toStrictEqual([
        {
          path: ['month'],
          actualValue: x,
          expectedType: '{ year: number, month: number, date: number }',
          typeName: '{ year: number, month: number, date: number }',
          message: 'Missing required key "month"',
        },
        {
          path: ['date'],
          actualValue: x,
          expectedType: '{ year: number, month: number, date: number }',
          typeName: '{ year: number, month: number, date: number }',
          message: 'Missing required key "date"',
        },
      ]);
      expect(validationErrorsToMessages(result.value)).toStrictEqual([
        'Missing required key "month" at month',
        'Missing required key "date" at date',
      ]);
    }
  });
});

describe('ymd2', () => {
  const ymd2 = record({
    year: int(asInt(1900)),
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

// Tests demonstrating ts-fortress correct behavior for io-ts bugs mentioned in README
describe('io-ts bug examples - correct behavior in ts-fortress', () => {
  describe('keyof type consistency (io-ts issue #697)', () => {
    test('keyof with numeric keys produces correct types and runtime behavior', () => {
      // ts-fortress: Runtime and types always match
      const T = keyof(
        record({
          0: undefinedType,
          1: undefinedType,
          2: undefinedType,
          3: undefinedType,
          4: undefinedType,
        }),
      );

      type T = TypeOf<typeof T>;
      // TypeScript correctly infers: "0" | "1" | "2" | "3" | "4" (string literals)
      expectType<T, '0' | '1' | '2' | '3' | '4'>('=');

      // Runtime behavior matches TypeScript types exactly
      expect(Result.isErr(T.validate(0))).toBe(true); // number 0 is rejected
      expect(Result.isOk(T.validate('0'))).toBe(true); // string "0" is accepted

      expect(Result.isOk(T.validate('1'))).toBe(true);
      expect(Result.isOk(T.validate('2'))).toBe(true);
      expect(Result.isOk(T.validate('3'))).toBe(true);
      expect(Result.isOk(T.validate('4'))).toBe(true);

      expect(Result.isErr(T.validate('5'))).toBe(true); // invalid key
      expect(Result.isErr(T.validate(1))).toBe(true); // number literal rejected
      expect(Result.isErr(T.validate('invalid'))).toBe(true); // invalid string
    });
  });

  describe('union validation consistency (io-ts issue #677)', () => {
    test('union validation produces predictable results without unexpected fields', () => {
      const A = record({
        A: union([number(0), undefinedType, nullType]),
      });

      const B = record({
        B: union([number(0), undefinedType, nullType]),
      });

      const C = partial(
        record({
          C: union([number(0), nullType]),
        }),
      );

      // Case 1: Union validation is predictable and correct
      {
        const UnionBA = union([B, A]);
        const result = UnionBA.validate({ A: 1 });

        expect(Result.isOk(result)).toBe(true);

        if (Result.isOk(result)) {
          // No unexpected fields added
          expect(result.value).toStrictEqual({ A: 1 });

          // Type guards behave correctly
          expect(A.is(result.value)).toBe(true); // Correct
          expect(B.is(result.value)).toBe(false); // Correct! B requires field B
        }
      }

      // Case 2: Consistent validation behavior
      {
        const UnionCA = union([C, A]);
        const result = UnionCA.validate({ A: 1 });

        expect(Result.isOk(result)).toBe(true);

        if (Result.isOk(result)) {
          // Correct and consistent result
          expect(result.value).toStrictEqual({ A: 1 });

          // Type guards work as expected
          expect(A.is(result.value)).toBe(true); // Correct
          // Note: In ts-fortress, partial types are more permissive and can accept
          // objects with additional fields, so C.is() returns true here.
          // This is different from io-ts behavior and shows ts-fortress's
          // consistent approach to partial type validation.
          expect(C.is(result.value)).toBe(true); // ts-fortress allows extra fields in partial
        }
      }
    });

    test('union validation handles partial types correctly', () => {
      const FullRecord = record({
        name: number(0),
        value: number(0),
      });

      const PartialRecord = partial(
        record({
          name: number(0),
          optional: number(0),
        }),
      );

      const UnionType = union([PartialRecord, FullRecord]);

      // Test with data that matches FullRecord
      {
        const result = UnionType.validate({ name: 42, value: 100 });
        expect(Result.isOk(result)).toBe(true);

        if (Result.isOk(result)) {
          expect(result.value).toStrictEqual({ name: 42, value: 100 });
          expect(FullRecord.is(result.value)).toBe(true);
          // Note: In ts-fortress, partial types accept objects with extra fields
          // so PartialRecord.is() returns true even with the 'value' field
          expect(PartialRecord.is(result.value)).toBe(true); // ts-fortress partial allows extra fields
        }
      }

      // Test with data that matches PartialRecord
      {
        const result = UnionType.validate({ name: 42 });
        expect(Result.isOk(result)).toBe(true);

        if (Result.isOk(result)) {
          expect(result.value).toStrictEqual({ name: 42 });
          expect(FullRecord.is(result.value)).toBe(false); // Missing 'value' field
          expect(PartialRecord.is(result.value)).toBe(true);
        }
      }
    });

    test('union validation with complex nested structures', () => {
      const TypeA = record({
        type: union([undefinedType]), // Only accepts undefined
        data: record({
          valueA: number(0),
        }),
      });

      const TypeB = record({
        type: nullType, // Only accepts null
        data: record({
          valueB: number(0),
        }),
      });

      const UnionAB = union([TypeA, TypeB]);

      // Test TypeA validation
      {
        const input = {
          type: undefined,
          data: { valueA: 42 },
        };

        const result = UnionAB.validate(input);
        expect(Result.isOk(result)).toBe(true);

        if (Result.isOk(result)) {
          expect(result.value).toStrictEqual(input);
          expect(TypeA.is(result.value)).toBe(true);
          expect(TypeB.is(result.value)).toBe(false);
        }
      }

      // Test TypeB validation
      {
        const input = {
          type: null,
          data: { valueB: 99 },
        };

        const result = UnionAB.validate(input);
        expect(Result.isOk(result)).toBe(true);

        if (Result.isOk(result)) {
          expect(result.value).toStrictEqual(input);
          expect(TypeA.is(result.value)).toBe(false);
          expect(TypeB.is(result.value)).toBe(true);
        }
      }

      // Test invalid data
      {
        const input = {
          type: 'invalid',
          data: { someField: 123 },
        };

        const result = UnionAB.validate(input);
        expect(Result.isErr(result)).toBe(true);
      }
    });
  });
});
