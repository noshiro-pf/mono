// Example: src/number/branded-types/int.mts (asInt)
import { Int, asInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const branded = asInt(42);

    assert.isTrue(branded === 42);

    assert.isTrue(Int.is(branded));

    // embed-sample-code-ignore-below
  });
}
