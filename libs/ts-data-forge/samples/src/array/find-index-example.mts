// Example: src/array/array-utils.mts (findIndex)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const letters = ['a', 'b', 'c'];

    const indexOfB = Arr.findIndex(letters, (letter) => letter === 'b');

    // eslint-disable-next-line unicorn/prefer-array-index-of
    const indexOfMissing = Arr.findIndex<string>((letter) => letter === 'z')(
      letters,
    );

    assert.isTrue(indexOfB === 1);

    assert.isTrue(indexOfMissing === -1);

    // embed-sample-code-ignore-below
  });
}
