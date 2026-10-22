// Example: src/functional/async-data/impl/async-data-is-async-data.mts
import { AsyncData, Result } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.isTrue(AsyncData.isAsyncData(AsyncData.idle));

    assert.isTrue(AsyncData.isAsyncData(AsyncData.err('boom')));

    // A plain Err has no `previous`.
    assert.isFalse(AsyncData.isAsyncData(Result.err('boom')));

    assert.isFalse(AsyncData.isAsyncData('loading'));

    // embed-sample-code-ignore-below
  });
}
