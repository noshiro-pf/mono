/* eslint-disable @typescript-eslint/no-confusing-void-expression */
import { expectType, Result } from 'ts-data-forge';
import { undefinedType } from './undefined.mjs';

describe('undefinedType', () => {
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

      expect(undefinedType.is(value)).toBe(true);
    });

    test('null returns false', () => {
      const value: unknown = null;

      if (undefinedType.is(value)) {
        expectType<typeof value, undefined>('=');
      } else {
        expectType<typeof value, {} | null>('=');
      }

      expect(undefinedType.is(value)).toBe(false);
    });

    test('other values return false', () => {
      const values = [
        0,
        '',
        false,
        Number.NaN,
        {},
        [],
        'undefined',
        42,
        true,
        null,
      ];

      for (const value of values) {
        const v: unknown = value;

        if (undefinedType.is(v)) {
          expectType<typeof v, undefined>('=');
        } else {
          expectType<typeof v, {} | null>('=');
        }

        expect(undefinedType.is(v)).toBe(false);
      }
    });
  });

  describe('assertIs', () => {
    test('undefined does not throw', () => {
      const value: unknown = undefined;
      expect(() => {
        undefinedType.assertIs(value);
      }).not.toThrow();
    });

    test('non-undefined throws', () => {
      const value: unknown = null;
      expect(() => {
        undefinedType.assertIs(value);
      }).toThrow(`Expected undefined, got ${typeof value}`);
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
      }).toThrow('Expected undefined, got object');
    });

    test('any non-undefined value throws error', () => {
      const values = [0, '', false, null, 42, 'hello'];

      for (const value of values) {
        expect(() => {
          undefinedType.cast(value);
        }).toThrow(`Expected undefined, got ${typeof value}`);
      }
    });
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

    test('other values return default (undefined)', () => {
      const values = [0, '', false, 42, 'hello', {}];

      for (const value of values) {
        const result = undefinedType.fill(value);
        expect(result).toBeUndefined();
      }
    });
  });

  describe('validate', () => {
    test('undefined is valid', () => {
      const value: unknown = undefined;
      const result = undefinedType.validate(value);

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBeUndefined();
      }
    });

    test('null is invalid', () => {
      const value: unknown = null;
      const result = undefinedType.validate(value);

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: null,
            expectedType: 'undefined',
            typeName: 'undefined',
            message: undefined,
          },
        ]);
      }
    });

    test('other values are invalid', () => {
      const value: unknown = 0;
      const result = undefinedType.validate(value);

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 0,
            expectedType: 'undefined',
            typeName: 'undefined',
            message: undefined,
          },
        ]);
      }
    });

    test('validate returns input as-is for OK cases', () => {
      const input = undefined;
      const result = undefinedType.validate(input);
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe(input); // ✅ same reference
      }
    });
  });
});
