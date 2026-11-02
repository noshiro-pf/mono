import * as Arr from 'ts-data-forge/array';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const numbers = [1, 2, 3] as const;

    // The same functions as `Arr` from 'ts-data-forge'
    assert.isTrue(Arr.isNonEmpty(numbers));

    assert.deepStrictEqual<readonly number[]>(
      Arr.toPushed(numbers, 4),
      [1, 2, 3, 4],
    );

    // embed-sample-code-ignore-below
  });
}
