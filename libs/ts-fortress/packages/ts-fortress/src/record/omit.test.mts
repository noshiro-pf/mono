import { expectType, Result } from 'ts-data-forge';
import { type UnknownRecord } from 'ts-type-forge';
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

  expectType<typeof ym, Type<Readonly<{ year: number; month: number }>>>('=');

  expectType<
    keyof typeof ym,
    | 'typeName'
    | 'defaultValue'
    | 'is'
    | 'assertIs'
    | 'cast'
    | 'fill'
    | 'prune'
    | 'validate'
    | 'optional'
  >('=');

  type Ym = TypeOf<typeof ym>;

  expectType<Ym, Readonly<{ year: number; month: number }>>('=');

  expectType<typeof ym.defaultValue, TypeOf<typeof ym>>('=');

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

    test('validate returns input as-is for OK cases', () => {
      const input: UnknownRecord = {
        year: 2000,
        month: 12,
      } as const;

      const result = ym.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      assert.deepStrictEqual(resultValue1, input); // Deep equality

      // In allow mode (default), same reference is returned
      expect(resultValue1).toBe(input); // Same reference
    });

    test('validate rejects excess properties when excessProperty is "reject"', () => {
      const ymReject = omit(
        record(
          {
            year: number(1900),
            month: number(1),
            date: number(1),
          },
          { excessProperty: 'reject' },
        ),
        ['date'],
      );

      const input: UnknownRecord = {
        year: 2000,
        month: 12,
        extra: 'not allowed',
      } as const;

      const result = ymReject.validate(input);

      assert.isTrue(Result.isErr(result));
    });

    test('validate accepts valid data without excess when excessProperty is "reject"', () => {
      const ymReject = omit(
        record(
          {
            year: number(1900),
            month: number(1),
            date: number(1),
          },
          { excessProperty: 'reject' },
        ),
        ['date'],
      );

      const input: UnknownRecord = {
        year: 2000,
        month: 12,
      } as const;

      const result = ymReject.validate(input);

      assert.isTrue(Result.isOk(result));

      expect(Result.unwrapThrow(result)).toBe(input); // ✅ same reference
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

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      assert.deepStrictEqual(resultValue2 as UnknownRecord, {
        year: 2000,
        month: 12,
        aaa: 999,
      });
    });

    test('validate returns input as-is for OK cases with additional keys', () => {
      const input: UnknownRecord = {
        year: 2000,
        month: 12,
        aaa: 999,
      } as const;

      const result = ym.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue3 = Result.unwrapThrow(result);

      // In allow mode (default), excess properties are kept
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      assert.deepStrictEqual(resultValue3 as UnknownRecord, {
        year: 2000,
        month: 12,
        aaa: 999,
      });

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
