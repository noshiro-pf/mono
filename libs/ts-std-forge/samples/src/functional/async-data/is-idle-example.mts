// Example: src/functional/async-data/impl/async-data-is-idle.mts
import { AsyncData } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const data = AsyncData.idle as AsyncData<number, string>;

    if (AsyncData.isIdle(data)) {
      assert.deepStrictEqual(data, AsyncData.idle);
    }

    // embed-sample-code-ignore-below
  });
}
