import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { pick } from './pick.mjs';
import { record } from './record.mjs';

describe(pick, () => {
  const ymd = record(
    {
      year: number(1900),
      month: number(1),
      date: number(1),
    },
    { excessPropertyValidation: 'strip' },
  );

  const ymdEased = record(
    {
      year: number(1900),
      month: number(1),
      date: number(1),
    },
    { excessPropertyValidation: 'allow' },
  );

  const ym = pick(ymd, ['year', 'month']);

  const ymEased = pick(ymdEased, ['year', 'month']);

  expectType<
    typeof ym,
    Type<Readonly<{ year: number; month: number }>> &
      Readonly<{
        shape: Readonly<{ year: Type<number>; month: Type<number> }>;
        excessPropertyValidation: 'strip';
        excessPropertyFill: 'allow' | 'strip';
      }>
  >('=');

  type Ym = TypeOf<typeof ym>;

  expectType<Ym, Readonly<{ year: number; month: number }>>('=');

  expectType<typeof ym.defaultValue, Ym>('=');

  describe('is', () => {
    test('truthy case', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 12,
      } as const;

      if (ym.is(x)) {
        expectType<typeof x, Ym>('=');
      } else {
        expectType<typeof x, UnknownRecord>('=');
      }

      assert.isTrue(ym.is(x));
    });

    test('falsy case', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 'ab',
      } as const;

      if (ym.is(x)) {
        expectType<typeof x, Ym>('=');
      } else {
        expectType<typeof x, UnknownRecord>('=');
      }

      assert.isFalse(ym.is(x));
    });
  });

  describe('validate', () => {
    test('truthy case', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 12,
      } as const;

      const result = ym.validate(x);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expectType<typeof resultValue, Ym>('=');

      assert.deepStrictEqual(resultValue, {
        year: 2000,
        month: 12,
      });
    });

    test('validate returns the stripped content of input with additional keys for OK cases if excessPropertyValidation is "strip"', () => {
      const input: UnknownRecord = {
        year: 2000,
        month: 12,
        aaa: 999,
      } as const;

      const result = ym.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue1, {
        year: 2000,
        month: 12,
      });

      expect(resultValue1).not.toBe(input); // ✅ different reference
    });

    test('validate returns input with additional keys as-is for OK cases', () => {
      const input: UnknownRecord = {
        year: 2000,
        month: 12,
      } as const;

      const result = ymEased.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });

    test('truthy case with additional keys', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 12,
        aaa: 999,
      } as const;

      const result = ym.validate(x);

      assert.isTrue(Result.isOk(result));

      const resultValue2 = Result.unwrapThrow(result);

      expectType<typeof resultValue2, Ym>('=');

      assert.deepStrictEqual(
        resultValue2,
        ym.cast({
          year: 2000,
          month: 12,
          aaa: 999,
        }),
      );
    });

    test('validate returns the stripped content of input for OK cases if excessPropertyValidation is "strip"', () => {
      const input = {
        year: 2000,
        month: 12,
        aaa: 999,
      } as const;

      const result = ym.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue3 = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue3, {
        year: 2000,
        month: 12,
      });

      expect(resultValue3).not.toBe(input); // ✅ different reference
    });

    test('validate returns input as-is for OK cases if excessPropertyValidation is "allow"', () => {
      const input: UnknownRecord = {
        year: 2000,
        month: 12,
        aaa: 999,
      } as const;

      const result = ymEased.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue3 = Result.unwrapThrow(result);

      expect(resultValue3).toBe(input); // ✅ same reference
    });

    test('falsy case', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 'ab',
      } as const;

      const result = ym.validate(x);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: ['month'],
          actualValue: 'ab',
          expectedType: 'number',
          typeName: 'number',
          details: undefined,
        },
      ]);

      assert.deepStrictEqual(validationErrorsToMessages(resultError), [
        'Error at month: expected <number> type but <string> type value "ab" was passed.',
      ]);
    });
  });

  describe('fill', () => {
    test('from an empty record', () => {
      const x: UnknownRecord = {} as const;

      assert.deepStrictEqual(ym.fill(x), {
        year: 1900,
        month: 1,
      });
    });

    test('from a filled record', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 999,
      } as const;

      assert.deepStrictEqual(ym.fill(x), {
        year: 2000,
        month: 999,
      });
    });

    test('from a partial record', () => {
      const x: UnknownRecord = {
        year: 2000,
      } as const;

      assert.deepStrictEqual(ym.fill(x), {
        year: 2000,
        month: 1,
      });
    });

    test('from a partial record with excess property', () => {
      const x: UnknownRecord = {
        year: 2000,
        aaaaa: 9999,
      } as const;

      assert.deepStrictEqual(ym.fill(x), {
        year: 2000,
        month: 1,
      });
    });
  });
});
