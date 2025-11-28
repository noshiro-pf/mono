import { expectType } from '../expect-type.mjs';
import { isNonEmptyString } from './is-non-empty-string.mjs';

describe(isNonEmptyString, () => {
  test('should return true for non-empty strings', () => {
    assert.isTrue(isNonEmptyString('hello'));

    assert.isTrue(isNonEmptyString('a'));

    assert.isTrue(isNonEmptyString(' ')); // Space is not empty

    assert.isTrue(isNonEmptyString('  multiple spaces  '));

    assert.isTrue(isNonEmptyString('123'));

    assert.isTrue(isNonEmptyString('special!@#$%'));
  });

  test('should return false for empty string', () => {
    assert.isFalse(isNonEmptyString(''));
  });

  test('should return false for non-string values', () => {
    assert.isFalse(isNonEmptyString(null));

    assert.isFalse(isNonEmptyString(undefined));

    // @ts-expect-error Testing non-string types
    assert.isFalse(isNonEmptyString(42));

    // @ts-expect-error Testing non-string types
    assert.isFalse(isNonEmptyString(0));

    // @ts-expect-error Testing non-string types
    assert.isFalse(isNonEmptyString(true));

    // @ts-expect-error Testing non-string types
    assert.isFalse(isNonEmptyString(false));

    // @ts-expect-error Testing non-string types
    assert.isFalse(isNonEmptyString({}));

    // @ts-expect-error Testing non-string types
    assert.isFalse(isNonEmptyString([]));

    // @ts-expect-error Testing non-string types
    assert.isFalse(isNonEmptyString(['string']));

    // @ts-expect-error Testing non-string types
    assert.isFalse(isNonEmptyString(() => 'string'));
  });

  test('should act as a type guard', () => {
    const value: unknown = 'test';

    // @ts-expect-error Testing non-string types
    if (isNonEmptyString(value)) {
      expectType<typeof value, string>('=');

      // TypeScript knows it's a string
      expect(value.length).toBeGreaterThan(0);

      expect(value.charAt(0)).toBe('t');
    }
  });

  test('should narrow string | undefined | null types', () => {
    const maybeString: string | undefined | null = 'hello';

    if (isNonEmptyString(maybeString)) {
      expectType<typeof maybeString, string>('=');

      expect(maybeString.toUpperCase()).toBe('HELLO');
    }
  });

  test('should work in filter operations', () => {
    const mixed: unknown[] = [
      'valid',
      '',
      null,
      'another',
      42,
      undefined,
      'third',
      false,
    ];

    // @ts-expect-error Testing non-string types
    const nonEmptyStrings = mixed.filter(isNonEmptyString);

    assert.deepStrictEqual(nonEmptyStrings, ['valid', 'another', 'third']);
  });

  test('should handle string edge cases', () => {
    assert.isTrue(isNonEmptyString('\n')); // Newline

    assert.isTrue(isNonEmptyString('\t')); // Tab

    assert.isTrue(isNonEmptyString('\r')); // Carriage return

    assert.isTrue(isNonEmptyString('\0')); // Null character

    assert.isTrue(isNonEmptyString('🎉')); // Emoji

    assert.isTrue(isNonEmptyString('你好')); // Unicode characters
  });

  test('should not accept String objects', () => {
    // @ts-expect-error Testing non-string types
    // eslint-disable-next-line unicorn/new-for-builtins
    assert.isFalse(isNonEmptyString(new String('hello') as unknown));
  });
});
