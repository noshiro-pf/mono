// Example: src/number/branded-types/safe-int.mts (SafeInt.abs)
import { SafeInt, asSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const negative = asSafeInt(-900);

    const absolute = SafeInt.abs(negative);

    assert.isTrue(absolute === 900);

    assert.isTrue(SafeInt.is(absolute));

    // embed-sample-code-ignore-below
  });
}
