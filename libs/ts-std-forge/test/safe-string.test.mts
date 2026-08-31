// cspell:ignore ababab
import { Result } from 'ts-data-forge';
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

  test('returns a tagged Err for a negative count', () => {
    const result = SafeString.repeat('ab', -1);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, { kind: 'invalid-count', count: -1 });
  });

  test('returns a tagged Err for an infinite count', () => {
    const result = SafeString.repeat('ab', Number.POSITIVE_INFINITY);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, {
      kind: 'invalid-count',
      count: Number.POSITIVE_INFINITY,
    });
  });

  test('truncates the count like ToIntegerOrInfinity (-0.5 is legal and yields the empty string)', () => {
    const result = SafeString.repeat('ab', -0.5);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, '');
  });

  test('returns the unexpected fallback when the result would exceed the engine string-length limit', () => {
    // 2^30 repetitions of a 2-char string exceed every engine's limit while
    // being perfectly legal per the ECMAScript range check — the
    // implementation-defined residue the fromThrowable backstop exists for.
    const result = SafeString.repeat('ab', 2 ** 30);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.kind, 'unexpected');
  });

  test.each([
    { count: 0 },
    { count: 1 },
    { count: 3 },
    { count: -1 },
    { count: -0.5 },
    { count: 2.5 },
    { count: Number.NaN },
    { count: Number.POSITIVE_INFINITY },
    { count: Number.NEGATIVE_INFINITY },
  ])('repeat("ab", $count) classifies exactly the raw throws', ({ count }) => {
    const thrown = throwsError(() => 'ab'.repeat(count));

    const result = SafeString.repeat('ab', count);

    assert.deepStrictEqual(Result.isErr(result), thrown);

    // Every engine throw must be classified in advance — 'unexpected' never
    // appears for a spec-defined condition.
    assert.deepStrictEqual(
      Result.isErr(result) && result.value.kind !== 'unexpected',
      thrown,
    );
  });
});
