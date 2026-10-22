// Example: src/functional/async-data/impl/async-data-is-ok.mts
import { AsyncData } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const data = AsyncData.ok(2) as AsyncData<number, string>;

    if (AsyncData.isOk(data)) {
      assert.strictEqual(data.value, 2);
    }

    // embed-sample-code-ignore-below
  });
}
