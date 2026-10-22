// Example: src/functional/async-data/impl/async-data-ok.mts
import { AsyncData, Result } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const data = AsyncData.ok(42);

    assert.isTrue(AsyncData.isOk(data));

    assert.deepStrictEqual(data, Result.ok(42));

    // embed-sample-code-ignore-below
  });
}
