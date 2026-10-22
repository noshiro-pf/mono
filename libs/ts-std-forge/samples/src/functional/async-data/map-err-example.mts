// Example: src/functional/async-data/impl/async-data-map-err.mts
import { AsyncData, Optional } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const failed = AsyncData.err(new Error('boom'), Optional.some(1));

    assert.deepStrictEqual(
      AsyncData.mapErr(failed, (error) => error.message),
      AsyncData.err('boom', Optional.some(1)),
    );

    assert.deepStrictEqual(
      AsyncData.mapErr(AsyncData.ok(1), (error: string) => error.length),
      AsyncData.ok(1),
    );

    // embed-sample-code-ignore-below
  });
}
