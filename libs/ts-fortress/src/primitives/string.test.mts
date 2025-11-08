/* cSpell:disable */

import { expectType, Result } from 'ts-data-forge';
import { type Type, type TypeOf } from '../type.mjs';
import { string } from './string.mjs';

describe(string, () => {
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
    test.each([
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
    ])('str.is($0) should be true', (v: unknown) => {
      if (str.is(v)) {
        expectType<typeof v, Str>('=');
      } else {
        expectType<typeof v, unknown>('=');
      }

      expect(str.is(v)).toBe(true);
    });

    test.each([
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
    ])('str.is($0) should be false', (v: unknown) => {
      if (str.is(v)) {
        expectType<typeof v, Str>('=');
      } else {
        expectType<typeof v, unknown>('=');
      }

      expect(str.is(v)).toBe(false);
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

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe('hello');
    });

    test('empty string is valid', () => {
      const value: unknown = '';
      const result = str.validate(value);

      expect(Result.isOk(result)).toBe(true);

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe('');
    });

    test('invalid value', () => {
      const value: unknown = 42;
      const result = str.validate(value);

      expect(Result.isErr(result)).toBe(true);

      const resultError = Result.unwrapErrThrow(result);

      assert.deepStrictEqual(resultError, [
        {
          path: [],
          actualValue: 42,
          expectedType: 'string',
          typeName: 'string',
          details: undefined,
        },
      ]);
    });

    test('validate returns input as-is for OK cases', () => {
      const input = 'hello world';
      const result = str.validate(input);

      expect(Result.isOk(result)).toBe(true);

      const resultValue2 = Result.unwrapThrow(result);

      expect(resultValue2).toBe(input); // ✅ same reference
    });
  });
});

describe('string with constraints', () => {
  test('string without constraints', () => {
    const type = string();

    expectType<typeof type, Type<string>>('=');

    expect(type.is('')).toBe(true);
  });

  describe('string constrained by startsWith', () => {
    test('accepts valid default value', () => {
      const type = string('abcdefghi', { startsWith: 'ab' });

      expectType<typeof type, Type<`ab${string}`>>('=');

      expect(type.is('ab')).toBe(true);

      expect(type.is('abcde__')).toBe(true);

      expect(type.is('cab')).toBe(false);
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "cab" does not start with "ab"
        string('cab', { startsWith: 'ab' }),
      ).toThrow('startsWith = ab');
    });

    test('empty startsWith', () => {
      expect(string('abc', { startsWith: '' }).is('abc')).toBe(true);
    });
  });

  describe('string constrained by endsWith', () => {
    test('accepts valid default value', () => {
      const type = string('abcdefghi', { endsWith: 'ghi' });

      expectType<TypeOf<typeof type>, `${string}ghi`>('=');

      expect(type.is('ghi')).toBe(true);

      expect(type.is('xyz_ghi')).toBe(true);

      expect(type.is('xyz')).toBe(false);
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "abc" does not end with "ba"
        string('abc', { endsWith: 'ba' }),
      ).toThrow('endsWith = ba');
    });

    test('empty endsWith', () => {
      expect(string('abc', { endsWith: '' }).is('abc')).toBe(true);
    });
  });

  describe('string constrained by includes', () => {
    test('accepts valid default value', () => {
      const type = string('abcdefghi', { includes: 'def' });

      expectType<TypeOf<typeof type>, `${string}def${string}`>('=');

      expect(type.is('def')).toBe(true);

      expect(type.is('xyz_def_uvw')).toBe(true);

      expect(type.is('xyz_uvw')).toBe(false);
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "abc" does not include "def"
        string('abc', { includes: 'def' }),
      ).toThrow('includes = def');
    });

    test('empty includes', () => {
      expect(string('abc', { includes: '' }).is('abc')).toBe(true);
    });
  });

  describe('string constrained by lowercase', () => {
    test('accepts valid default value', () => {
      const type = string('abcdefghi', { lowercase: true });

      expectType<typeof type, Type<string>>('=');

      expect(type.is('abcde__')).toBe(true);

      expect(type.is('ABC')).toBe(false);
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "ABCDEFGHI" is not assignable if lowercase is true
        string('ABCDEFGHI', { lowercase: true }),
      ).toThrow('lowercase = true');
    });
  });

  describe('string constrained by uppercase', () => {
    test('accepts valid default value', () => {
      const type = string('ABCDEFGHI', { uppercase: true });

      expectType<typeof type, Type<string>>('=');

      expect(type.is('ABC')).toBe(true);

      expect(type.is('abc')).toBe(false);
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "abcdefghi" is not assignable if uppercase is true
        string('abcdefghi', { uppercase: true }),
      ).toThrow('uppercase = true');
    });
  });

  describe('string constrained by nonempty', () => {
    test('accepts valid default value', () => {
      const type = string('nonempty', { nonempty: true });

      expectType<typeof type, Type<string>>('=');

      expect(type.is('value')).toBe(true);

      expect(type.is('')).toBe(false);
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "" is not assignable if nonempty is true
        string('', { nonempty: true }),
      ).toThrow('nonempty = true');
    });
  });

  describe('string constrained by minLength', () => {
    test('accepts valid default value', () => {
      const type = string('minimum', { minLength: 3 });

      expectType<typeof type, Type<string>>('=');

      expect(type.is('hello')).toBe(true);

      expect(type.is('hi')).toBe(false);
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "hi" is not assignable if minLength is 3
        string('hi', { minLength: 3 }),
      ).toThrow('minLength = 3');
    });

    test('negative minLength', () => {
      const type = string('minimum', { minLength: -1 });

      expectType<typeof type, Type<string>>('=');

      expect(type.is('hello')).toBe(true);

      expect(type.is('hi')).toBe(true);
    });
  });

  describe('string constrained by maxLength', () => {
    test('accepts valid default value', () => {
      const type = string('short', { maxLength: 5 });

      expectType<typeof type, Type<string>>('=');

      expect(type.is('tiny')).toBe(true);

      expect(type.is('excessive')).toBe(false);
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "too-long" is not assignable if maxLength is 5
        string('too-long', { maxLength: 5 }),
      ).toThrow('maxLength = 5');
    });
  });

  describe('string constrained by regex', () => {
    test('accepts valid default value', () => {
      const numeric = /^\d+$/u;
      const type = string('12345', { regex: numeric });

      expectType<typeof type, Type<string>>('=');

      expect(type.is('67890')).toBe(true);

      expect(type.is('abc123')).toBe(false);
    });

    test('rejects invalid default value', () => {
      const numeric = /^\d+$/u;

      expect(() => string('abc', { regex: numeric })).toThrow(
        String.raw`regex = ^\d+$`,
      );
    });
  });

  describe('complex constraints', () => {
    describe('string constrained by startsWith and endsWith', () => {
      test('accepts valid default value', () => {
        const type = string('abba', { startsWith: 'ab', endsWith: 'ba' });

        expectType<TypeOf<typeof type>, `ab${string}` & `${string}ba`>('=');

        expect(type.is('aba')).toBe(true);

        expect(type.is('abba')).toBe(true);

        expect(type.is('abca')).toBe(false);

        expect(type.is('caba')).toBe(false);
      });

      test('rejects invalid default value', () => {
        expect(() =>
          // @ts-expect-error "abba" does not end with "zz"
          string('abba', { startsWith: 'ab', endsWith: 'zz' }),
        ).toThrow('endsWith = zz');
      });
    });

    describe('string constrained by startsWith, includes, and endsWith', () => {
      test('accepts valid default value', () => {
        const type = string('abcdef', {
          startsWith: 'ab',
          includes: 'cd',
          endsWith: 'ef',
        });

        expectType<
          TypeOf<typeof type>,
          `ab${string}` & `${string}cd${string}` & `${string}ef`
        >('=');

        expect(type.is('abcdef')).toBe(true);

        expect(type.is('abXXcdef')).toBe(true);

        expect(type.is('ab__ef')).toBe(false);

        expect(type.is('zzcdef')).toBe(false);

        expect(type.is('abcdefx')).toBe(false);
      });

      test('rejects invalid default value', () => {
        expect(() =>
          // @ts-expect-error "abcdbye" does not end with "hi"
          string('abcdbye', {
            startsWith: 'ab',
            includes: 'cd',
            endsWith: 'hi',
          }),
        ).toThrow('endsWith = hi');

        expect(() =>
          // @ts-expect-error "abcdhi" does not includes "cd"
          string('abxxhi', {
            startsWith: 'ab',
            includes: 'cd',
            endsWith: 'hi',
          }),
        ).toThrow('includes = cd');
      });
    });

    describe('string constrained by uppercase and lowercase', () => {
      test('accepts valid default value', () => {
        const type = string('1234', { uppercase: true, lowercase: true });

        expectType<typeof type, Type<string>>('=');

        expect(type.is('1234')).toBe(true);

        expect(type.is('ABCD')).toBe(false);

        expect(type.is('abcd')).toBe(false);
      });

      test('rejects invalid default value', () => {
        expect(() =>
          // @ts-expect-error "Ab" is neither strictly uppercase nor lowercase
          string('Ab', { uppercase: true, lowercase: true }),
        ).toThrow('uppercase = true');
      });
    });

    describe('string constrained by nonempty, minLength, and maxLength', () => {
      test('accepts valid default value', () => {
        const type = string('token', {
          nonempty: true,
          minLength: 3,
          maxLength: 8,
        });

        expectType<typeof type, Type<string>>('=');

        expect(type.is('value')).toBe(true);

        expect(type.is('')).toBe(false);

        expect(type.is('hi')).toBe(false);

        expect(type.is('extra-long-token')).toBe(false);
      });

      test('rejects invalid default value', () => {
        expect(() =>
          // @ts-expect-error "extra-long-token" violates maxLength = 8
          string('extra-long-token', {
            nonempty: true,
            minLength: 3,
            maxLength: 8,
          }),
        ).toThrow(
          'defaultValue "extra-long-token" for string does not satisfy the constraint maxLength = 8',
        );
      });

      test('rejects invalid default value 2', () => {
        expect(() =>
          // @ts-expect-error "extra-long-token" violates maxLength = 8
          string('1234', {
            nonempty: true,
            minLength: 8,
            maxLength: 3,
          }),
        ).toThrow(
          'defaultValue "1234" for string does not satisfy the constraint minLength = 8',
        );
      });
    });

    describe('string constrained by regex and includes', () => {
      test('accepts valid default value', () => {
        const slug = /^[a-z-]+$/u;
        const type = string('feature-flag', {
          includes: 'feature',
          regex: slug,
        });

        expectType<typeof type, Type<`${string}feature${string}`>>('=');

        expect(type.is('feature-toggle')).toBe(true);

        expect(type.is('featureflag')).toBe(true);

        expect(type.is('feature_flag')).toBe(false);

        expect(type.is('flag')).toBe(false);
      });

      test('rejects invalid default value', () => {
        const slug = /^[a-z-]+$/u;

        expect(() =>
          string('featureFLAG', { includes: 'feature', regex: slug }),
        ).toThrow('regex = ^[a-z-]+$');
      });
    });

    describe('string constrained by minLength, maxLength, and regex', () => {
      test('accepts valid default value', () => {
        const digits = /^[0-9]+$/u;
        const type = string('12345', {
          minLength: 4,
          maxLength: 6,
          regex: digits,
        });

        expectType<typeof type, Type<string>>('=');

        expect(type.is('6789')).toBe(true);

        expect(type.is('6789012')).toBe(false);

        expect(type.is('678')).toBe(false);

        expect(type.is('67a9')).toBe(false);
      });

      test('rejects invalid default value', () => {
        const digits = /^[0-9]+$/u;

        expect(() =>
          // @ts-expect-error "1234567" violates maxLength = 6
          string('1234567', {
            minLength: 4,
            maxLength: 6,
            regex: digits,
          }),
        ).toThrow('maxLength = 6');
      });
    });
  });
});
