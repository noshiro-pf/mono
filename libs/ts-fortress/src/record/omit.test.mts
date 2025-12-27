import { expectType, Result } from 'ts-data-forge';
import { number } from '../primitives/index.mjs';
import { type Type, type TypeOf } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { omit } from './omit.mjs';
import { record } from './record.mjs';

describe(omit, () => {
  const ymd = record({
    year: number(1900),
    month: number(1),
    date: number(1),
  });

  const ym = omit(ymd, ['date']);

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
      };

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
      };

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
      };

      const result = ym.validate(x);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expectType<typeof resultValue, Ym>('=');

      assert.deepStrictEqual(resultValue, {
        year: 2000,
        month: 12,
      });
    });

    test('validate returns input as-is for OK cases', () => {
      const input: UnknownRecord = {
        year: 2000,
        month: 12,
      };

      const result = ym.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue1, input); // Deep equality

      // In strip mode (default), a new object is created even without excess properties
      expect(resultValue1).not.toBe(input); // Different reference
    });

    test('validate returns input as-is for OK cases (allow mode)', () => {
      const ymAllow = omit(
        record(
          {
            year: number(1900),
            month: number(1),
            date: number(1),
          },
          { excessPropertyValidation: 'allow' },
        ),
        ['date'],
      );

      const input: UnknownRecord = {
        year: 2000,
        month: 12,
      };

      const result = ymAllow.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue1, input); // Deep equality

      // In allow mode, the same reference is returned
      expect(resultValue1).toBe(input); // Same reference
    });

    test('truthy case with additional keys', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 12,
        aaa: 999,
      };

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

    test('validate returns input as-is for OK cases with additional keys', () => {
      const input: UnknownRecord = {
        year: 2000,
        month: 12,
        aaa: 999,
      };

      const result = ym.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue3 = Result.unwrapThrow(result);

      // In strip mode, excess properties are removed, so we get a new object
      assert.deepStrictEqual(resultValue3, {
        year: 2000,
        month: 12,
      });

      expect(resultValue3).not.toBe(input); // Different reference
    });

    test('falsy case', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 'ab',
      };

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
      const x: UnknownRecord = {};

      assert.deepStrictEqual(ym.fill(x), {
        year: 1900,
        month: 1,
      });
    });

    test('from a filled record', () => {
      const x: UnknownRecord = {
        year: 2000,
        month: 999,
      };

      assert.deepStrictEqual(ym.fill(x), {
        year: 2000,
        month: 999,
      });
    });

    test('from a partial record', () => {
      const x: UnknownRecord = {
        year: 2000,
      };

      assert.deepStrictEqual(ym.fill(x), {
        year: 2000,
        month: 1,
      });
    });

    test('from a partial record with excess property', () => {
      const x: UnknownRecord = {
        year: 2000,
        aaaaa: 9999,
      };

      assert.deepStrictEqual(ym.fill(x), {
        year: 2000,
        month: 1,
      });
    });
  });
});
