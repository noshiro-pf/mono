// Example: src/functional/async-data/impl/async-data-settle.mts
import { AsyncData, Optional, Result } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const loaded = AsyncData.ok(1);

    const refreshing = AsyncData.toPending(loaded);

    const failed = AsyncData.settle(refreshing, Result.err('timeout'));

    // The failure keeps the value from before the refresh.
    assert.deepStrictEqual(failed, AsyncData.err('timeout', Optional.some(1)));

    const retried = AsyncData.settle(Result.ok(2))(AsyncData.toPending(failed));

    assert.deepStrictEqual(retried, AsyncData.ok(2));

    // embed-sample-code-ignore-below
  });
}
