// cspell:ignore ababab
import { Result } from 'ts-data-forge';
import { SafeString } from '../src/index.mjs';

describe('SafeString.fromCodePoint', () => {
  test('returns Ok for valid code points', () => {
    const result = SafeString.fromCodePoint(0x61, 0x1f600);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, 'a😀');
  });

  test('returns Ok for no arguments (empty string)', () => {
    const result = SafeString.fromCodePoint();

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, '');
  });

  test('returns Err for a code point above 0x10FFFF', () => {
    const result = SafeString.fromCodePoint(0x110000);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.name, 'RangeError');
  });

  test('returns Err for a non-integer code point', () => {
    const result = SafeString.fromCodePoint(0.5);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.name, 'RangeError');
  });
});

describe('SafeString.normalize', () => {
  test('returns Ok with the default form (NFC)', () => {
    // NFC composes U+0041 + U+030A into U+00C5 (written as escapes, because
    // source literals in the two normalization forms look identical).
    const result = SafeString.normalize('A\u{30A}');

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, '\u{C5}');
  });

  test('returns Ok for an explicit form', () => {
    // NFD decomposes U+00C5 into U+0041 + U+030A.
    const result = SafeString.normalize('\u{C5}', 'NFD');

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, 'A\u{30A}');
  });

  test('returns Err when the type-level guard is bypassed at runtime', () => {
    // The `form` parameter is union-typed, so an invalid form is normally a
    // compile-time error; this checks the runtime safety net behind it.
    // @ts-expect-error -- deliberately passing an invalid form
    const result = SafeString.normalize('a', 'NFX');

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.name, 'RangeError');
  });
});

describe('SafeString.repeat', () => {
  test('returns Ok for a non-negative count', () => {
    const result = SafeString.repeat('ab', 3);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, 'ababab');
  });

  test('returns Ok for count 0 (empty string)', () => {
    const result = SafeString.repeat('ab', 0);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, '');
  });

  test('returns Err for a negative count', () => {
    const result = SafeString.repeat('ab', -1);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.name, 'RangeError');
  });

  test('returns Err for an infinite count', () => {
    const result = SafeString.repeat('ab', Number.POSITIVE_INFINITY);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.name, 'RangeError');
  });
});
