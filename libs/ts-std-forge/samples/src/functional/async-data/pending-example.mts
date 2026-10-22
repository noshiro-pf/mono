// Example: src/functional/async-data/impl/async-data-pending.mts
import { AsyncData, Optional } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const firstLoad = AsyncData.pending();

    assert.deepStrictEqual(firstLoad.previous, Optional.none);

    const reload = AsyncData.pending(Optional.some([1, 2, 3]));

    assert.deepStrictEqual(reload.previous, Optional.some([1, 2, 3]));

    // embed-sample-code-ignore-below
  });
}
