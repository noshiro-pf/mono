// Example: src/functional/async-data/impl/async-data-is-settled.mts
import { AsyncData, Result } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const data = AsyncData.ok(2) as AsyncData<number, string>;

    if (AsyncData.isSettled(data)) {
      // A settled AsyncData is a Result.
      assert.deepStrictEqual(
        Result.map(data, (n) => n * 2),
        Result.ok(4),
      );
    }

    // embed-sample-code-ignore-below
  });
}
