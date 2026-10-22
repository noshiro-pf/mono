// Example: src/functional/async-data/impl/async-data-is-err.mts
import { AsyncData, Optional } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const data = AsyncData.err('boom', Optional.some(1)) as AsyncData<
      number,
      string
    >;

    if (!AsyncData.isErr(data)) {
      return;
    }

    assert.strictEqual(data.value, 'boom');

    assert.deepStrictEqual(data.previous, Optional.some(1));

    // embed-sample-code-ignore-below
  });
}
