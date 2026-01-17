/* eslint-disable vitest/expect-expect */
// Example: src/functional/optional.mts (Optional.isNone)
import { expectType, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const optionalValue = Optional.none as Optional<number>;

    if (Optional.isNone(optionalValue)) {
      // Type narrowed to None
      expectType<typeof optionalValue, None>('=');
    }

    // embed-sample-code-ignore-below
  });
}
