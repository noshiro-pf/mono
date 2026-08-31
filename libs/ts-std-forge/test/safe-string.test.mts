// cspell:ignore ababab
import { asSafeUint, Result } from 'ts-data-forge';
import { SafeString } from '../src/index.mjs';

/**
 * Whether calling `fn` throws — used by the equivalence sweep to compare the
 * wrapper against the raw stdlib API over the same inputs.
 */
const throwsError = (fn: () => unknown): boolean => {
  try {
    fn();

    return false;
  } catch {
    return true;
  }
};

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

  test('returns a tagged Err for a code point above 0x10FFFF', () => {
    const result = SafeString.fromCodePoint(0x110000);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, {
      kind: 'invalid-code-point',
      codePoint: 0x110000,
      index: 0,
    });
  });

  test('returns a tagged Err for a non-integer code point', () => {
    const result = SafeString.fromCodePoint(0.5);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, {
      kind: 'invalid-code-point',
      codePoint: 0.5,
      index: 0,
    });
  });

  test('reports the index of the first invalid code point', () => {
    const result = SafeString.fromCodePoint(0x61, 0x62, -1, 0.5);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, {
      kind: 'invalid-code-point',
      codePoint: -1,
      index: 2,
    });
  });

  test.each([
    { codePoint: 0 },
    { codePoint: 0x10ffff },
    { codePoint: 0x110000 },
    { codePoint: -1 },
    { codePoint: 0.5 },
    { codePoint: Number.NaN },
    { codePoint: Number.POSITIVE_INFINITY },
  ])(
    'fromCodePoint($codePoint) classifies exactly the raw throws',
    ({ codePoint }) => {
      const thrown = throwsError(() => String.fromCodePoint(codePoint));

      const result = SafeString.fromCodePoint(codePoint);

      assert.deepStrictEqual(Result.isErr(result), thrown);

      // Every engine throw must be classified in advance — 'unexpected'
      // never appears for a spec-defined condition.
      assert.deepStrictEqual(
        Result.isErr(result) && result.value.kind !== 'unexpected',
        thrown,
      );
    },
  );
});

describe('SafeString.normalize', () => {
  test('returns the normalized string with the default form (NFC)', () => {
    // NFC composes U+0041 + U+030A into U+00C5 (written as escapes, because
    // source literals in the two normalization forms look identical).
    assert.deepStrictEqual(SafeString.normalize('A\u{30A}'), '\u{C5}');
  });

  test('returns the normalized string for an explicit form', () => {
    // NFD decomposes U+00C5 into U+0041 + U+030A.
    assert.deepStrictEqual(SafeString.normalize('\u{C5}', 'NFD'), 'A\u{30A}');
  });

  test('throws like the raw API when the type-level guard is bypassed', () => {
    // The `form` union type is the whole guarantee: an invalid form is a
    // compile-time error, and a caller that defeats the type system gets the
    // raw RangeError. There is no runtime safety net by design (D-26).
    expect(() =>
      // @ts-expect-error -- deliberately passing an invalid form
      SafeString.normalize('a', 'NFX'),
    ).toThrow(RangeError);
  });
});

describe('SafeString.repeat', () => {
  test('returns Ok for a small literal count (no cast needed)', () => {
    const result = SafeString.repeat('ab', 3);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, 'ababab');
  });

  test('returns Ok for count 0 (empty string)', () => {
    const result = SafeString.repeat('ab', 0);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, '');
  });

  test('returns Ok for a large count via asSafeUint', () => {
    const result = SafeString.repeat('ab', asSafeUint(1000));

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, 'ab'.repeat(1000));
  });

  test('returns the unexpected fallback when the result would exceed the engine string-length limit', () => {
    // 2^30 repetitions of a 2-char string exceed every engine's limit while
    // being a perfectly legal count — the implementation-defined residue the
    // fromThrowable backstop exists for.
    const result = SafeString.repeat('ab', asSafeUint(2 ** 30));

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.kind, 'unexpected');
  });

  test('a type-bypassed negative count is still caught by the backstop', () => {
    // Unlike the fully type-refined functions, repeat keeps its fromThrowable
    // backstop for the length-limit residue, so a count smuggled past the
    // type system comes back as 'unexpected' rather than a raw throw.
    const result = SafeString.repeat(
      'ab',
      // @ts-expect-error -- deliberately passing a negative count
      -1,
    );

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.kind, 'unexpected');
  });
});
