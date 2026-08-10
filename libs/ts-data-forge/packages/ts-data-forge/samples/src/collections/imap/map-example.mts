// Example: src/collections/imap.mts (map)
import { IMap } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const entries = [
      ['a', 1],
      ['b', 2],
    ] as const satisfies readonly (readonly [string, number])[];

    const map = IMap.create(entries);

    const doubled = map.map((value) => value * 2);

    assert.deepStrictEqual(Array.from(doubled), [
      ['a', 2],
      ['b', 4],
    ]);

    // embed-sample-code-ignore-below
  });
}
