import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { number } from './number.mjs';

describe('number', () => {
  describe('default value', () => {
    test('without explicit default value', () => {
      const numDefault = number();
      expect(numDefault.defaultValue).toBe(0);
    });

    test('with explicit default value', () => {
      const numCustom = number(42);
      expect(numCustom.defaultValue).toBe(42);
    });
  });

  const num = number();
  type Num = TypeOf<typeof num>;

  expectType<Num, number>('=');
  expectType<typeof num.defaultValue, Num>('=');

  describe('is', () => {
    test('truthy cases', () => {
      const values = [
        0,
        42,
        -42,
        3.14,
        -3.14,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NaN,
      ];

      for (const value of values) {
        const v: unknown = value;

        if (num.is(v)) {
          expectType<typeof v, Num>('=');
        } else {
          expectType<typeof v, unknown>('=');
        }

        expect(num.is(v)).toBe(true);
      }
    });

    test('falsy cases', () => {
      const values = [
        '42',
        '0',
        true,
        false,
        null,
        undefined,
        {},
        [],
        Symbol('test'),
      ];

      for (const value of values) {
        const v: unknown = value;

        if (num.is(v)) {
          expectType<typeof v, Num>('=');
        } else {
          expectType<typeof v, unknown>('=');
        }

        expect(num.is(v)).toBe(false);
      }
    });
  });

  describe('assertIs', () => {
    const assertIs: (a: unknown) => asserts a is number = num.assertIs;

    test('valid number', () => {
      const value: unknown = 42;
      expect(() => {
        assertIs(value);
      }).not.toThrow();
    });

    test('invalid value throws', () => {
      const value: unknown = '42';
      expect(() => {
        assertIs(value);
      }).toThrow(/Expected <number>/u);
    });
  });

  describe('cast', () => {
    test('valid number returns as is', () => {
      const value: unknown = 42;
      const result = num.cast(value);
      expect(result).toBe(42);
    });

    test('invalid value throws error', () => {
      const value: unknown = 'not a number';
      expect(() => num.cast(value)).toThrow(
        'Expected <number>, got <string> type value "not a number".',
      );
    });

    test('throws error with type mismatch', () => {
      const numWithDefault = number(100);
      const value: unknown = 'not a number';
      expect(() => numWithDefault.cast(value)).toThrow(
        'Expected <number>, got <string> type value "not a number".',
      );
    });
  });

  describe('fill', () => {
    test('valid number returns as is', () => {
      const value: unknown = 42;
      const result = num.fill(value);
      expect(result).toBe(42);
    });

    test('undefined returns default', () => {
      const value: unknown = undefined;
      const result = num.fill(value);
      expect(result).toBe(0);
    });

    test('null returns default', () => {
      const value: unknown = null;
      const result = num.fill(value);
      expect(result).toBe(0);
    });

    test('invalid value returns default', () => {
      const value: unknown = 'not a number';
      const result = num.fill(value);
      expect(result).toBe(0);
    });

    test('uses custom default value for invalid', () => {
      const numWithDefault = number(100);
      const value: unknown = 'not a number';
      const result = numWithDefault.fill(value);
      expect(result).toBe(100);
    });
  });

  describe('validate', () => {
    test('valid number', () => {
      const value: unknown = 42;
      const result = num.validate(value);

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe(42);
      }
    });

    test('invalid value', () => {
      const value: unknown = 'not a number';
      const result = num.validate(value);

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 'not a number',
            expectedType: 'number',
            typeName: 'number',
            message: undefined,
          },
        ]);
      }
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 123.456;
      const result = num.validate(input);
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe(input); // ✅ same reference
      }
    });
  });
});
