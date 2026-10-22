// Example: src/functional/async-data/impl/async-data-to-result.mts
import { AsyncData, Optional, Result } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.deepStrictEqual(
      AsyncData.toResult(AsyncData.err('boom', Optional.some(1))),
      Optional.some(Result.err('boom')),
    );

    assert.deepStrictEqual(
      AsyncData.toResult(AsyncData.pending()),
      Optional.none,
    );

    // embed-sample-code-ignore-below
  });
}
