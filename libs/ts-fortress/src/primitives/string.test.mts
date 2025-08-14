import { expectType, Result } from 'ts-data-forge';
import { type TypeOf } from '../type.mjs';
import { string, stringLiteral } from './string.mjs';

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

  const str = string('');
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
      }).toThrow(/Expected string/u);
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
      expect(() => str.cast(value)).toThrow('Expected string, got number');
    });

    test('throws error with type mismatch', () => {
      const strWithDefault = string('default');
      const value: unknown = 42;
      expect(() => strWithDefault.cast(value)).toThrow(
        'Expected string, got number',
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
  });
});

describe('stringLiteral', () => {
  const hello = stringLiteral('hello');
  type Hello = TypeOf<typeof hello>;

  expectType<Hello, 'hello'>('=');
  expectType<typeof hello.defaultValue, Hello>('=');

  describe('default value', () => {
    test('uses literal as default', () => {
      expect(hello.defaultValue).toBe('hello');
    });
  });

  describe('is', () => {
    test('exact match returns true', () => {
      const value: unknown = 'hello';

      if (hello.is(value)) {
        expectType<typeof value, Hello>('=');
      } else {
        expectType<typeof value, unknown>('=');
      }

      expect(hello.is(value)).toBe(true);
    });

    test('different string returns false', () => {
      const value: unknown = 'world';

      if (hello.is(value)) {
        expectType<typeof value, Hello>('=');
      } else {
        expectType<typeof value, unknown>('=');
      }

      expect(hello.is(value)).toBe(false);
    });

    test('non-string returns false', () => {
      const value: unknown = 42;

      expect(hello.is(value)).toBe(false);
    });
  });

  describe('special string literals', () => {
    test('empty string literal', () => {
      const empty = stringLiteral('');
      type Empty = TypeOf<typeof empty>;
      expectType<Empty, ''>('=');

      expect(empty.is('')).toBe(true);
      expect(empty.is(' ')).toBe(false);
    });

    test('whitespace literal', () => {
      const whitespace = stringLiteral('   ');
      type Whitespace = TypeOf<typeof whitespace>;
      expectType<Whitespace, '   '>('=');

      expect(whitespace.is('   ')).toBe(true);
      expect(whitespace.is('  ')).toBe(false);
      expect(whitespace.is('    ')).toBe(false);
    });

    test('emoji literal', () => {
      const emoji = stringLiteral('🎉');
      type Emoji = TypeOf<typeof emoji>;
      expectType<Emoji, '🎉'>('=');

      expect(emoji.is('🎉')).toBe(true);
      expect(emoji.is('🎊')).toBe(false);
    });

    test('multiline literal', () => {
      const multiline = stringLiteral('line1\nline2');
      type Multiline = TypeOf<typeof multiline>;
      expectType<Multiline, 'line1\nline2'>('=');

      expect(multiline.is('line1\nline2')).toBe(true);
      expect(multiline.is(String.raw`line1\nline2`)).toBe(false);
    });
  });

  describe('validate', () => {
    test('exact match', () => {
      const value: unknown = 'hello';
      const result = hello.validate(value);

      expect(Result.isOk(result)).toBe(true);
      if (Result.isOk(result)) {
        expect(result.value).toBe('hello');
      }
    });

    test('different value', () => {
      const value: unknown = 'world';
      const result = hello.validate(value);

      expect(Result.isErr(result)).toBe(true);
      if (Result.isErr(result)) {
        expect(result.value).toStrictEqual([
          {
            path: [],
            actualValue: 'world',
            expectedType: 'stringLiteral(hello)',
            typeName: 'stringLiteral(hello)',
            message: undefined,
          },
        ]);
      }
    });
  });

  describe('cast', () => {
    test('valid literal returns as is', () => {
      const value: unknown = 'hello';
      const result = hello.cast(value);
      expect(result).toBe('hello');
    });

    test('invalid value throws error', () => {
      const value: unknown = 'world';
      expect(() => hello.cast(value)).toThrow(
        'Expected stringLiteral(hello), got string',
      );
    });
  });

  describe('fill', () => {
    test('valid literal returns as is', () => {
      const value: unknown = 'hello';
      const result = hello.fill(value);
      expect(result).toBe('hello');
    });

    test('undefined returns default (the literal itself)', () => {
      const value: unknown = undefined;
      const result = hello.fill(value);
      expect(result).toBe('hello');
    });

    test('different value returns default', () => {
      const value: unknown = 'world';
      const result = hello.fill(value);
      expect(result).toBe('hello');
    });
  });
});
