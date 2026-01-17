// Example: src/functional/optional.mts (Optional.unwrapThrow)
import { Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const present = Optional.some('available');

    assert.isTrue(Optional.unwrapThrow(present) === 'available');

    assert.throws(
      () => Optional.unwrapThrow(Optional.none),
      /has failed because it is `None`/u,
    );

    // embed-sample-code-ignore-below
  });
}
