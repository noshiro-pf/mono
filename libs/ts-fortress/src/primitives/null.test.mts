import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { nullType } from './null.mjs';

describe('nullType', () => {
  type Null = TypeOf<typeof nullType>;

  expectType<Null, null>('=');
  expectType<typeof nullType.defaultValue, Null>('=');

  describe('default value', () => {
    test('is null', () => {
      expect(nullType.defaultValue).toBeNull();
    });
  });

  describe('is', () => {
    test('null returns true', () => {
      const value: unknown = null;

      if (nullType.is(value)) {
        expectType<typeof value, Null>('=');
      } else {
        expectType<typeof value, {} | undefined>('=');
      }

      expect(nullType.is(value)).toBe(true);
    });

    test('undefined returns false', () => {
      const value: unknown = undefined;

      if (nullType.is(value)) {
        expectType<typeof value, Null>('=');
      } else {
        expectType<typeof value, {} | undefined>('=');
      }

      expect(nullType.is(value)).toBe(false);
    });

    test('other values return false', () => {
      const values = [0, '', false, Number.NaN, {}, [], 'null', 42, true];

      for (const value of values) {
        const v: unknown = value;

        if (nullType.is(v)) {
          expectType<typeof v, Null>('=');
        } else {
          expectType<typeof v, {} | undefined>('=');
        }

        expect(nullType.is(v)).toBe(false);
      }
    });
  });

  describe('assertIs', () => {
    test('null does not throw', () => {
      const value: unknown = null;
      expect(() => {
        nullType.assertIs(value);
      }).not.toThrow();
    });

    test('non-null throws', () => {
      const value: unknown = undefined;
      expect(() => {
        nullType.assertIs(value);
      }).toThrow('Expected null, got undefined');
    });
  });

  describe('cast', () => {
    test('null returns null', () => {
      const value: unknown = null;
      const result = nullType.cast(value);
      expect(result).toBeNull();
    });

    test('non-null throws error', () => {
      const value: unknown = undefined;
      expect(() => nullType.cast(value)).toThrow(
        'Expected null, got undefined',
      );
    });

    test('any non-null value throws error', () => {
      const values = [0, '', false, undefined, 42, 'hello'];

      for (const value of values) {
        expect(() => nullType.cast(value)).toThrow(
          /Expected null, got (number|string|boolean|undefined)/u,
        );
      }
    });
  });

  describe('fill', () => {
    test('null returns null', () => {
      const value: unknown = null;
      const result = nullType.fill(value);
      expect(result).toBeNull();
    });

    test('undefined returns default (null)', () => {
      const value: unknown = undefined;
      const result = nullType.fill(value);
      expect(result).toBeNull();
    });

    test('other values return default (null)', () => {
      const values = [0, '', false, 42, 'hello', {}];

      for (const value of values) {
        const result = nullType.fill(value);
        expect(result).toBeNull();
      }
    });
  });

  describe('validate', () => {
    test('null is valid', () => {
      const value: unknown = null;
      const result = nullType.validate(value);

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBeNull();
      }
    });

    test('undefined is invalid', () => {
      const value: unknown = undefined;
      const result = nullType.validate(value);

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: undefined,
            expectedType: 'null',
            typeName: 'null',
            message: undefined,
          },
        ]);
      }
    });

    test('other values are invalid', () => {
      const value: unknown = 0;
      const result = nullType.validate(value);

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 0,
            expectedType: 'null',
            typeName: 'null',
            message: undefined,
          },
        ]);
      }
    });

    test('validate returns input as-is for OK cases', () => {
      const input = null;
      const result = nullType.validate(input);
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe(input); // ✅ same reference
      }
    });
  });
});
