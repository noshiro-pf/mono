// Example: src/functional/async-data/impl/async-data-idle.mts
import { AsyncData, Optional } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const data = AsyncData.idle;

    assert.isTrue(AsyncData.isIdle(data));

    assert.deepStrictEqual(AsyncData.latestOk(data), Optional.none);

    // embed-sample-code-ignore-below
  });
}
