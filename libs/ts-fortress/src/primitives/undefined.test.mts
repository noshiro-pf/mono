/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { expectType, Result } from 'ts-data-forge';
import { undefinedType } from './undefined.mjs';

describe('undefined type', () => {
  expectType<undefined, undefined>('=');

  expectType<typeof undefinedType.defaultValue, undefined>('=');

  describe('default value', () => {
    test('is undefined', () => {
      expect(undefinedType.defaultValue).toBeUndefined();
    });
  });

  describe('is', () => {
    test('undefined returns true', () => {
      const value: unknown = undefined;

      if (undefinedType.is(value)) {
        expectType<typeof value, undefined>('=');
      } else {
        expectType<typeof value, {} | null>('=');
      }

      assert.isTrue(undefinedType.is(value));
    });

    test('null returns false', () => {
      const value: unknown = null;

      if (undefinedType.is(value)) {
        expectType<typeof value, undefined>('=');
      } else {
        expectType<typeof value, {} | null>('=');
      }

      assert.isFalse(undefinedType.is(value));
    });

    test.each([0, '', false, Number.NaN, {}, [], 'undefined', 42, true, null])(
      'undefinedType.is($0) should be false',
      (u: unknown) => {
        if (undefinedType.is(u)) {
          expectType<typeof u, undefined>('=');
        } else {
          expectType<typeof u, {} | null>('=');
        }

        assert.isFalse(undefinedType.is(u));
      },
    );
  });

  describe('assertIs', () => {
    test('undefined does not throw', () => {
      const value: unknown = undefined;

      expect(() => {
        undefinedType.assertIs(value);
      }).not.toThrowError();
    });

    test('non-undefined throws', () => {
      const value: unknown = null;

      expect(() => {
        undefinedType.assertIs(value);
      }).toThrowError(
        'Error: expected <undefined> type but <object> type value `null` was passed.',
      );
    });
  });

  describe('cast', () => {
    test('undefined returns undefined', () => {
      const value: unknown = undefined;

      const result = undefinedType.cast(value);

      expect(result).toBeUndefined();
    });

    test('non-undefined throws error', () => {
      const value: unknown = null;

      expect(() => {
        undefinedType.cast(value);
      }).toThrowError(
        'Error: expected <undefined> type but <object> type value `null` was passed.',
      );
    });

    test.each([0, '', false, null, 42, 'hello'] as const)(
      'undefinedType.cast($0) should throw error',
      (v) => {
        expect(() => {
          undefinedType.cast(v);
        }).toThrowError(
          /^Error: expected <undefined> type but <.*> type value .+\.$/u,
        );
      },
    );
  });

  describe('fill', () => {
    test('undefined returns undefined', () => {
      const value: unknown = undefined;

      const result = undefinedType.fill(value);

      expect(result).toBeUndefined();
    });

    test('null returns default (undefined)', () => {
      const value: unknown = null;

      const result = undefinedType.fill(value);

      expect(result).toBeUndefined();
    });

    test.each([0, '', false, 42, 'hello', {}] as const)(
      'undefinedType.fill($0) return default (undefined)',
      (v) => {
        const result = undefinedType.fill(v);

        expect(result).toBeUndefined();
      },
    );
  });

  describe('validate', () => {
    test('undefined is valid', () => {
      const value: unknown = undefined;

      const result = undefinedType.validate(value);

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBeUndefined();
    });

    test('null is invalid', () => {
      const value: unknown = null;

      const result = undefinedType.validate(value);

      assert.isTrue(Result.isErr(result));

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: null,
          expectedType: 'undefined',
          typeName: 'undefined',
          details: undefined,
        },
      ]);
    });

    test('other values are invalid', () => {
      const value: unknown = 0;

      const result = undefinedType.validate(value);

      assert.isTrue(Result.isErr(result));

      const resultError1 = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError1, [
        {
          path: [],
          actualValue: 0,
          expectedType: 'undefined',
          typeName: 'undefined',
          details: undefined,
        },
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = undefined;

      const result = undefinedType.validate(input);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe(input); // ✅ same reference
    });
  });
});
