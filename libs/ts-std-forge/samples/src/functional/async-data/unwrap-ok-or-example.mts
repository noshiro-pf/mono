// Example: src/functional/async-data/impl/async-data-unwrap-ok-or.mts
import { AsyncData } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.strictEqual(AsyncData.unwrapOkOr(AsyncData.ok(1), 0), 1);

    assert.strictEqual(AsyncData.unwrapOkOr(AsyncData.err('boom'), 0), 0);

    const unwrapOrZero = AsyncData.unwrapOkOr(0);

    assert.strictEqual(unwrapOrZero(AsyncData.idle), 0);

    // embed-sample-code-ignore-below
  });
}
