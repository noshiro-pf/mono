// Example: src/functional/optional.mts (Optional.zip)
import { Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const zipped = Optional.zip(Optional.some('left'), Optional.some(1));

    assert.isTrue(Optional.isSome(zipped));

    if (Optional.isSome(zipped)) {
      const expected: readonly [string, number] = ['left', 1];

      assert.deepStrictEqual(zipped.value, expected);
    }

    const missing = Optional.zip(
      Optional.some('value'),
      Optional.none as Optional<number>,
    );

    assert.deepStrictEqual(missing, Optional.none);

    // embed-sample-code-ignore-below
  });
}
