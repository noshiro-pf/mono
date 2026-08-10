// Example: src/number/branded-types/safe-int.mts (asSafeInt)
import { SafeInt, asSafeInt } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const branded = asSafeInt(123);

    assert.isTrue(branded === 123);

    assert.isTrue(SafeInt.is(branded));

    // embed-sample-code-ignore-below
  });
}
