// Example: src/functional/optional.mts (Optional.expectToBe)
import { Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const optionalValue = Optional.some('data');

    assert.isTrue(
      Optional.expectToBe(optionalValue, 'value expected') === 'data',
    );

    const expectValue = Optional.expectToBe<string>('missing optional');

    assert.throws(() => expectValue(Optional.none), /missing optional/u);

    assert.isTrue(expectValue(Optional.some('present')) === 'present');

    // embed-sample-code-ignore-below
  });
}
