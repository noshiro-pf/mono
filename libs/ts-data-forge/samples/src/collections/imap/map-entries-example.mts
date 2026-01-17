// Example: src/collections/imap.mts (mapEntries)
import { IMap } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const entries = [
      ['a', 1],
      ['b', 2],
    ] satisfies readonly (readonly [string, number])[];

    const map = IMap.create(entries);

    const swapped = map.mapEntries(
      ([key, value]) => [value, key] satisfies readonly [number, string],
    );

    assert.deepStrictEqual(Array.from(swapped), [
      [1, 'a'],
      [2, 'b'],
    ]);

    // embed-sample-code-ignore-below
  });
}
