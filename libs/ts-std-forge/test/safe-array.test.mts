import { expectType, Result, SafeArray } from '../src/index.mjs';

describe('SafeArray.isArray', () => {
  test('agrees with Array.isArray at runtime', () => {
    const values: readonly unknown[] = [
      [],
      [1, 2, 3],
      'Ada',
      0,
      undefined,
      null,
      { length: 2 },
      new Set([1]),
    ];

    for (const value of values) {
      assert.strictEqual(SafeArray.isArray(value), Array.isArray(value));
    }
  });

  test('keeps the array members of a union and discards the rest', () => {
    const value = [1, 2] as readonly number[] | string;

    assert.isTrue(SafeArray.isArray(value));

    if (SafeArray.isArray(value)) {
      expectType<typeof value, readonly number[]>('=');

      assert.deepStrictEqual(value, [1, 2]);
    }
  });

  test('narrows unknown to readonly unknown[] rather than to any[]', () => {
    const value: unknown = [1, 2];

    if (SafeArray.isArray(value)) {
      expectType<typeof value, readonly unknown[]>('=');

      assert.strictEqual(value.length, 2);
    }
  });
});

describe('SafeArray.isEmpty', () => {
  test('is true for an empty array and false otherwise', () => {
    assert.isTrue(SafeArray.isEmpty([]));

    assert.isFalse(SafeArray.isEmpty([1]));

    assert.isFalse(SafeArray.isEmpty([undefined]));
  });

  test('narrows to the empty tuple', () => {
    const values: readonly number[] = [];

    if (SafeArray.isEmpty(values)) {
      expectType<typeof values, readonly []>('=');
    }
  });
});

describe('SafeArray.isNonEmpty', () => {
  test('is true for a non-empty array and false otherwise', () => {
    assert.isTrue(SafeArray.isNonEmpty([1]));

    assert.isTrue(SafeArray.isNonEmpty([undefined]));

    assert.isFalse(SafeArray.isNonEmpty([]));
  });

  test('narrows the first element out of `E | undefined`', () => {
    const values: readonly number[] = [1, 2];

    assert.isTrue(SafeArray.isNonEmpty(values));

    if (SafeArray.isNonEmpty(values)) {
      expectType<(typeof values)[0], number>('=');

      assert.strictEqual(values[0], 1);
    }
  });

  test('is the complement of isEmpty over the same inputs', () => {
    const arrays: readonly (readonly number[])[] = [[], [0], [0, 1]];

    for (const array of arrays) {
      assert.strictEqual(
        SafeArray.isNonEmpty(array),
        !SafeArray.isEmpty(array),
      );
    }
  });
});

describe('SafeArray.create', () => {
  test('returns Ok with `length` copies of the initial value', () => {
    const result = SafeArray.create(3, 1);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, [1, 1, 1]);
  });

  test('returns Ok with an empty array for length 0', () => {
    const result = SafeArray.create(0, 'Ada');

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, []);
  });

  test('shares one reference across the elements', () => {
    const init: { readonly tag: string } = { tag: 'x' };

    const result = SafeArray.create(2, init);

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(result.value[0], init);

    assert.strictEqual(result.value[0], result.value[1]);
  });

  test.each([
    { length: -1 },
    { length: -0.5 },
    { length: 1.5 },
    { length: Number.NaN },
    { length: Number.POSITIVE_INFINITY },
    { length: Number.NEGATIVE_INFINITY },
    { length: 2 ** 32 },
  ])('returns a tagged Err for length $length', ({ length }) => {
    const result = SafeArray.create(length, 0);

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value, { kind: 'invalid-length', length });
  });

  test('rejects the lengths `Array.from` would silently accept', () => {
    // `Array.from({ length })` applies ToLength, which clamps a negative
    // length to 0 and truncates a fractional one — the silent wrong answer
    // this wrapper exists to turn into a failure.
    for (const length of [-1, Number.NaN] as const) {
      assert.deepStrictEqual(
        Array.from({ length }, () => 0),
        [],
      );

      assert.isTrue(Result.isErr(SafeArray.create(length, 0)));
    }

    assert.deepStrictEqual(
      Array.from({ length: 1.5 }, () => 0),
      [0],
    );

    assert.isTrue(Result.isErr(SafeArray.create(1.5, 0)));
  });
});
