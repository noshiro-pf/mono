// Example: src/functional/async-data/impl/async-data-unwrap-ok.mts
import { AsyncData, Optional } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.strictEqual(AsyncData.unwrapOk(AsyncData.ok(1)), 1);

    // A previous value is not returned.
    assert.isUndefined(AsyncData.unwrapOk(AsyncData.pending(Optional.some(1))));

    // embed-sample-code-ignore-below
  });
}
