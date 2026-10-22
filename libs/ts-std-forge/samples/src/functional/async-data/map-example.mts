// Example: src/functional/async-data/impl/async-data-map.mts
import { AsyncData, Optional } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.deepStrictEqual(
      AsyncData.map(AsyncData.ok(3), (n) => n * 2),
      AsyncData.ok(6),
    );

    // The previous value is mapped as well.
    assert.deepStrictEqual(
      AsyncData.map(AsyncData.err('boom', Optional.some(3)), (n) => n * 2),
      AsyncData.err('boom', Optional.some(6)),
    );

    const doubleData = AsyncData.map((n: number) => n * 2);

    assert.deepStrictEqual(
      doubleData(AsyncData.pending(Optional.some(1))),
      AsyncData.pending(Optional.some(2)),
    );

    // embed-sample-code-ignore-below
  });
}
