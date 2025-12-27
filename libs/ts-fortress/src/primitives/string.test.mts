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

      assert.isTrue(str.is(v));
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

      assert.isFalse(str.is(v));
    });
  });

  describe('assertIs', () => {
    const assertIs: (a: unknown) => asserts a is string = str.assertIs;

    test('valid string', () => {
      const value: unknown = 'hello';

      expect(() => {
        assertIs(value);
      }).not.toThrowError();
    });

    test('invalid value throws', () => {
      const value: unknown = 42;

      expect(() => {
        assertIs(value);
      }).toThrowError(/Error: expected <string> type/u);
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

      expect(() => str.cast(value)).toThrowError(
        'Error: expected <string> type but <number> type value `42` was passed.',
      );
    });

    test('throws error with type mismatch', () => {
      const strWithDefault = string('default');

      const value: unknown = 42;

      expect(() => strWithDefault.cast(value)).toThrowError(
        'Error: expected <string> type but <number> type value `42` was passed.',
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

      assert.isTrue(Result.isOk(result));

      const resultValue = Result.unwrapThrow(result);

      expect(resultValue).toBe('hello');
    });

    test('empty string is valid', () => {
      const value: unknown = '';

      const result = str.validate(value);

      assert.isTrue(Result.isOk(result));

      const resultValue1 = Result.unwrapThrow(result);

      expect(resultValue1).toBe('');
    });

    test('invalid value', () => {
      const value: unknown = 42;

      const result = str.validate(value);

      assert.isTrue(Result.isErr(result));

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

      assert.isTrue(Result.isOk(result));

      const resultValue2 = Result.unwrapThrow(result);

      expect(resultValue2).toBe(input); // ✅ same reference
    });
  });
});

describe('string with constraints', () => {
  test('string without constraints', () => {
    const type = string();

    expectType<typeof type, Type<string>>('=');

    assert.isTrue(type.is(''));
  });

  describe('string constrained by startsWith', () => {
    test('accepts valid default value', () => {
      const type = string('abcdefghi', { startsWith: 'ab' });

      expectType<typeof type, Type<`ab${string}`>>('=');

      assert.isTrue(type.is('ab'));

      assert.isTrue(type.is('abcde__'));

      assert.isFalse(type.is('cab'));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "cab" does not start with "ab"
        string('cab', { startsWith: 'ab' }),
      ).toThrowError('startsWith = ab');
    });

    test('empty startsWith', () => {
      assert.isTrue(string('abc', { startsWith: '' }).is('abc'));
    });
  });

  describe('string constrained by endsWith', () => {
    test('accepts valid default value', () => {
      const type = string('abcdefghi', { endsWith: 'ghi' });

      expectType<TypeOf<typeof type>, `${string}ghi`>('=');

      assert.isTrue(type.is('ghi'));

      assert.isTrue(type.is('xyz_ghi'));

      assert.isFalse(type.is('xyz'));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "abc" does not end with "ba"
        string('abc', { endsWith: 'ba' }),
      ).toThrowError('endsWith = ba');
    });

    test('empty endsWith', () => {
      assert.isTrue(string('abc', { endsWith: '' }).is('abc'));
    });
  });

  describe('string constrained by includes', () => {
    test('accepts valid default value', () => {
      const type = string('abcdefghi', { includes: 'def' });

      expectType<TypeOf<typeof type>, `${string}def${string}`>('=');

      assert.isTrue(type.is('def'));

      assert.isTrue(type.is('xyz_def_uvw'));

      assert.isFalse(type.is('xyz_uvw'));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "abc" does not include "def"
        string('abc', { includes: 'def' }),
      ).toThrowError('includes = def');
    });

    test('empty includes', () => {
      assert.isTrue(string('abc', { includes: '' }).is('abc'));
    });
  });

  describe('string constrained by lowercase', () => {
    test('accepts valid default value', () => {
      const type = string('abcdefghi', { lowercase: true });

      expectType<typeof type, Type<string>>('=');

      assert.isTrue(type.is('abcde__'));

      assert.isFalse(type.is('ABC'));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "ABCDEFGHI" is not assignable if lowercase is true
        string('ABCDEFGHI', { lowercase: true }),
      ).toThrowError('lowercase = true');
    });
  });

  describe('string constrained by uppercase', () => {
    test('accepts valid default value', () => {
      const type = string('ABCDEFGHI', { uppercase: true });

      expectType<typeof type, Type<string>>('=');

      assert.isTrue(type.is('ABC'));

      assert.isFalse(type.is('abc'));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "abcdefghi" is not assignable if uppercase is true
        string('abcdefghi', { uppercase: true }),
      ).toThrowError('uppercase = true');
    });
  });

  describe('string constrained by nonempty', () => {
    test('accepts valid default value', () => {
      const type = string('nonempty', { nonempty: true });

      expectType<typeof type, Type<string>>('=');

      assert.isTrue(type.is('value'));

      assert.isFalse(type.is(''));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "" is not assignable if nonempty is true
        string('', { nonempty: true }),
      ).toThrowError('nonempty = true');
    });
  });

  describe('string constrained by minLength', () => {
    test('accepts valid default value', () => {
      const type = string('minimum', { minLength: 3 });

      expectType<typeof type, Type<string>>('=');

      assert.isTrue(type.is('hello'));

      assert.isFalse(type.is('hi'));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "hi" is not assignable if minLength is 3
        string('hi', { minLength: 3 }),
      ).toThrowError('minLength = 3');
    });

    test('negative minLength', () => {
      const type = string('minimum', { minLength: -1 });

      expectType<typeof type, Type<string>>('=');

      assert.isTrue(type.is('hello'));

      assert.isTrue(type.is('hi'));
    });
  });

  describe('string constrained by maxLength', () => {
    test('accepts valid default value', () => {
      const type = string('short', { maxLength: 5 });

      expectType<typeof type, Type<string>>('=');

      assert.isTrue(type.is('tiny'));

      assert.isFalse(type.is('excessive'));
    });

    test('rejects invalid default value', () => {
      expect(() =>
        // @ts-expect-error "too-long" is not assignable if maxLength is 5
        string('too-long', { maxLength: 5 }),
      ).toThrowError('maxLength = 5');
    });
  });

  describe('string constrained by regex', () => {
    test('accepts valid default value', () => {
      const numeric = /^\d+$/u;

      const type = string('12345', { regex: numeric });

      expectType<typeof type, Type<string>>('=');

      assert.isTrue(type.is('67890'));

      assert.isFalse(type.is('abc123'));
    });

    test('rejects invalid default value', () => {
      const numeric = /^\d+$/u;

      expect(() => string('abc', { regex: numeric })).toThrowError(
        String.raw`regex = ^\d+$`,
      );
    });
  });

  describe('complex constraints', () => {
    describe('string constrained by startsWith and endsWith', () => {
      test('accepts valid default value', () => {
        const type = string('abba', { startsWith: 'ab', endsWith: 'ba' });

        expectType<TypeOf<typeof type>, `ab${string}` & `${string}ba`>('=');

        assert.isTrue(type.is('aba'));

        assert.isTrue(type.is('abba'));

        assert.isFalse(type.is('abca'));

        assert.isFalse(type.is('caba'));
      });

      test('rejects invalid default value', () => {
        expect(() =>
          // @ts-expect-error "abba" does not end with "zz"
          string('abba', { startsWith: 'ab', endsWith: 'zz' }),
        ).toThrowError('endsWith = zz');
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

        assert.isTrue(type.is('abcdef'));

        assert.isTrue(type.is('abXXcdef'));

        assert.isFalse(type.is('ab__ef'));

        assert.isFalse(type.is('zzcdef'));

        assert.isFalse(type.is('abcdefx'));
      });

      test('rejects invalid default value', () => {
        expect(() =>
          // @ts-expect-error "abcdbye" does not end with "hi"
          string('abcdbye', {
            startsWith: 'ab',
            includes: 'cd',
            endsWith: 'hi',
          }),
        ).toThrowError('endsWith = hi');

        expect(() =>
          // @ts-expect-error "abcdhi" does not includes "cd"
          string('abxxhi', {
            startsWith: 'ab',
            includes: 'cd',
            endsWith: 'hi',
          }),
        ).toThrowError('includes = cd');
      });
    });

    describe('string constrained by uppercase and lowercase', () => {
      test('accepts valid default value', () => {
        const type = string('1234', { uppercase: true, lowercase: true });

        expectType<typeof type, Type<string>>('=');

        assert.isTrue(type.is('1234'));

        assert.isFalse(type.is('ABCD'));

        assert.isFalse(type.is('abcd'));
      });

      test('rejects invalid default value', () => {
        expect(() =>
          // @ts-expect-error "Ab" is neither strictly uppercase nor lowercase
          string('Ab', { uppercase: true, lowercase: true }),
        ).toThrowError('uppercase = true');
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

        assert.isTrue(type.is('value'));

        assert.isFalse(type.is(''));

        assert.isFalse(type.is('hi'));

        assert.isFalse(type.is('extra-long-token'));
      });

      test('rejects invalid default value', () => {
        expect(() =>
          // @ts-expect-error "extra-long-token" violates maxLength = 8
          string('extra-long-token', {
            nonempty: true,
            minLength: 3,
            maxLength: 8,
          }),
        ).toThrowError(
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
        ).toThrowError(
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

        assert.isTrue(type.is('feature-toggle'));

        assert.isTrue(type.is('featureflag'));

        assert.isFalse(type.is('feature_flag'));

        assert.isFalse(type.is('flag'));
      });

      test('rejects invalid default value', () => {
        const slug = /^[a-z-]+$/u;

        expect(() =>
          string('featureFLAG', { includes: 'feature', regex: slug }),
        ).toThrowError('regex = ^[a-z-]+$');
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

        assert.isTrue(type.is('6789'));

        assert.isFalse(type.is('6789012'));

        assert.isFalse(type.is('678'));

        assert.isFalse(type.is('67a9'));
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
        ).toThrowError('maxLength = 6');
      });
    });
  });
});
