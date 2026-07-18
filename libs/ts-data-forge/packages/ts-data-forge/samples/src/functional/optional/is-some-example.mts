// Example: src/functional/optional.mts (Optional.isSome)
import { Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const optionalNumber = Optional.some(42);

    if (Optional.isSome(optionalNumber)) {
      const value: number = optionalNumber.value;

      assert.isTrue(value === 42);
    }

    // embed-sample-code-ignore-below
  });
}
