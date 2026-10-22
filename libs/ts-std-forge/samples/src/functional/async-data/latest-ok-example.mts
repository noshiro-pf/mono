// Example: src/functional/async-data/impl/async-data-latest-ok.mts
import { AsyncData, Optional } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.deepStrictEqual(
      AsyncData.latestOk(AsyncData.ok(1)),
      Optional.some(1),
    );

    assert.deepStrictEqual(
      AsyncData.latestOk(AsyncData.pending(Optional.some(1))),
      Optional.some(1),
    );

    assert.deepStrictEqual(
      AsyncData.latestOk(AsyncData.err('boom', Optional.some(1))),
      Optional.some(1),
    );

    assert.deepStrictEqual(AsyncData.latestOk(AsyncData.idle), Optional.none);

    // embed-sample-code-ignore-below
  });
}
