import { expectType } from '../expect-type.mjs';
import { isNonEmptyString } from './is-non-empty-string.mjs';

describe(isNonEmptyString, () => {
  test('should return true for non-empty strings', () => {
    expect(isNonEmptyString('hello')).toBe(true);
    expect(isNonEmptyString('a')).toBe(true);
    expect(isNonEmptyString(' ')).toBe(true); // Space is not empty
    expect(isNonEmptyString('  multiple spaces  ')).toBe(true);
    expect(isNonEmptyString('123')).toBe(true);
    expect(isNonEmptyString('special!@#$%')).toBe(true);
  });

  test('should return false for empty string', () => {
    expect(isNonEmptyString('')).toBe(false);
  });

  test('should return false for non-string values', () => {
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    // @ts-expect-error Testing non-string types
    expect(isNonEmptyString(42)).toBe(false);
    // @ts-expect-error Testing non-string types
    expect(isNonEmptyString(0)).toBe(false);
    // @ts-expect-error Testing non-string types
    expect(isNonEmptyString(true)).toBe(false);
    // @ts-expect-error Testing non-string types
    expect(isNonEmptyString(false)).toBe(false);
    // @ts-expect-error Testing non-string types
    expect(isNonEmptyString({})).toBe(false);
    // @ts-expect-error Testing non-string types
    expect(isNonEmptyString([])).toBe(false);
    // @ts-expect-error Testing non-string types
    expect(isNonEmptyString(['string'])).toBe(false);
    // @ts-expect-error Testing non-string types
    expect(isNonEmptyString(() => 'string')).toBe(false);
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
    expect(isNonEmptyString('\n')).toBe(true); // Newline
    expect(isNonEmptyString('\t')).toBe(true); // Tab
    expect(isNonEmptyString('\r')).toBe(true); // Carriage return
    expect(isNonEmptyString('\0')).toBe(true); // Null character
    expect(isNonEmptyString('🎉')).toBe(true); // Emoji
    expect(isNonEmptyString('你好')).toBe(true); // Unicode characters
  });

  test('should not accept String objects', () => {
    // @ts-expect-error Testing non-string types
    // eslint-disable-next-line unicorn/new-for-builtins
    expect(isNonEmptyString(new String('hello') as unknown)).toBe(false);
  });
});
