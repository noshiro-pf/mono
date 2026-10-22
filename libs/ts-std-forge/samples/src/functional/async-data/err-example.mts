// Example: src/functional/async-data/impl/async-data-err.mts
import { AsyncData, Optional, Result } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const failed = AsyncData.err('network error', Optional.some(42));

    assert.isTrue(AsyncData.isErr(failed));

    assert.strictEqual(failed.value, 'network error');

    assert.deepStrictEqual(failed.previous, Optional.some(42));

    // It is still an Err of Result.
    assert.isTrue(Result.isErr(failed));

    // embed-sample-code-ignore-below
  });
}
