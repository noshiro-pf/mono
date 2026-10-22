// Example: src/functional/async-data/impl/async-data-is-pending.mts
import { AsyncData, Optional } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const data = AsyncData.pending(Optional.some(1)) as AsyncData<
      number,
      string
    >;

    if (AsyncData.isPending(data)) {
      assert.deepStrictEqual(data.previous, Optional.some(1));
    }

    // embed-sample-code-ignore-below
  });
}
