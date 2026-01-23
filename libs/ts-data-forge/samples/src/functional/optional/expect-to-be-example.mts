// Example: src/functional/optional.mts (Optional.expectToBe)
import { Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', (): void => {
    // embed-sample-code-ignore-above
    const optionalValue = Optional.some('data');

    assert.isTrue(
      Optional.expectToBe(optionalValue, 'value expected') === 'data',
    );

    const expectValue = Optional.expectToBe<string>('missing optional');

    const throwTest = (): void => {
      expectValue(Optional.none);
    };

    assert.throws(throwTest, /missing optional/u);

    assert.isTrue(expectValue(Optional.some('present')) === 'present');

    // embed-sample-code-ignore-below
  });
}
