// Example: src/functional/async-data/impl/async-data-to-pending.mts
import { AsyncData, Optional } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.deepStrictEqual(
      AsyncData.toPending(AsyncData.ok(1)),
      AsyncData.pending(Optional.some(1)),
    );

    assert.deepStrictEqual(
      AsyncData.toPending(AsyncData.err('boom', Optional.some(1))),
      AsyncData.pending(Optional.some(1)),
    );

    assert.deepStrictEqual(
      AsyncData.toPending(AsyncData.idle),
      AsyncData.pending(),
    );

    // embed-sample-code-ignore-below
  });
}
