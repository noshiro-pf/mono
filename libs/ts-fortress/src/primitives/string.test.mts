import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { string } from './string.mjs';

describe('string', () => {
  describe('default value', () => {
    test('without explicit default value', () => {
      const strDefault = string();
      expect(strDefault.defaultValue).toBe('');
    });

    test('with explicit default value', () => {
      const strCustom = string('hello');
      expect(strCustom.defaultValue).toBe('hello');
    });
  });

  const str = string();
  type Str = TypeOf<typeof str>;

  expectType<Str, string>('=');
  expectType<typeof str.defaultValue, Str>('=');

  describe('is', () => {
    test('truthy cases', () => {
      const values = [
        '',
        'hello',
        'world',
        '123',
        'true',
        'false',
        '   ',
        '\n',
        '\t',
        '🎉',
      ];

      for (const value of values) {
        const v: unknown = value;

        if (str.is(v)) {
          expectType<typeof v, Str>('=');
        } else {
          expectType<typeof v, unknown>('=');
        }

        expect(str.is(v)).toBe(true);
      }
    });

    test('falsy cases', () => {
      const values = [
        42,
        0,
        true,
        false,
        null,
        undefined,
        {},
        [],
        Symbol('test'),
        Number.NaN,
      ];

      for (const value of values) {
        const v: unknown = value;

        if (str.is(v)) {
          expectType<typeof v, Str>('=');
        } else {
          expectType<typeof v, unknown>('=');
        }

        expect(str.is(v)).toBe(false);
      }
    });
  });

  describe('assertIs', () => {
    const assertIs: (a: unknown) => asserts a is string = str.assertIs;

    test('valid string', () => {
      const value: unknown = 'hello';
      expect(() => {
        assertIs(value);
      }).not.toThrow();
    });

    test('invalid value throws', () => {
      const value: unknown = 42;
      expect(() => {
        assertIs(value);
      }).toThrow(/Expected <string>/u);
    });
  });

  describe('cast', () => {
    test('valid string returns as is', () => {
      const value: unknown = 'hello';
      const result = str.cast(value);
      expect(result).toBe('hello');
    });

    test('invalid value throws error', () => {
      const value: unknown = 42;
      expect(() => str.cast(value)).toThrow(
        'Expected <string>, got <number> type value `42`.',
      );
    });

    test('throws error with type mismatch', () => {
      const strWithDefault = string('default');
      const value: unknown = 42;
      expect(() => strWithDefault.cast(value)).toThrow(
        'Expected <string>, got <number> type value `42`.',
      );
    });
  });

  describe('fill', () => {
    test('valid string returns as is', () => {
      const value: unknown = 'hello';
      const result = str.fill(value);
      expect(result).toBe('hello');
    });

    test('undefined returns default', () => {
      const value: unknown = undefined;
      const result = str.fill(value);
      expect(result).toBe('');
    });

    test('null returns default', () => {
      const value: unknown = null;
      const result = str.fill(value);
      expect(result).toBe('');
    });

    test('invalid value returns default', () => {
      const value: unknown = 42;
      const result = str.fill(value);
      expect(result).toBe('');
    });

    test('uses custom default value for invalid', () => {
      const strWithDefault = string('default');
      const value: unknown = 42;
      const result = strWithDefault.fill(value);
      expect(result).toBe('default');
    });
  });

  describe('validate', () => {
    test('valid string', () => {
      const value: unknown = 'hello';
      const result = str.validate(value);

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe('hello');
      }
    });

    test('empty string is valid', () => {
      const value: unknown = '';
      const result = str.validate(value);

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe('');
      }
    });

    test('invalid value', () => {
      const value: unknown = 42;
      const result = str.validate(value);

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 42,
            expectedType: 'string',
            typeName: 'string',
            message: undefined,
          },
        ]);
      }
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 'hello world';
      const result = str.validate(input);
      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe(input); // ✅ same reference
      }
    });
  });
});
