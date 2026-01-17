// Example: src/number/branded-types/uint.mts (isUint)
import { Uint, isUint } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.isTrue(isUint(4));

    assert.isFalse(isUint(-1));

    assert.isTrue(Uint.is(0));

    // embed-sample-code-ignore-below
  });
}
