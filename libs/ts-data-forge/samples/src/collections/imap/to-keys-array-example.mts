// Example: src/collections/imap.mts (toKeysArray)
import { IMap } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const entries = [
      ['x', 10],
      ['y', 20],
    ] as const satisfies readonly (readonly [string, number])[];

    const map = IMap.create(entries);

    assert.deepStrictEqual(map.toKeysArray(), ['x', 'y']);

    // embed-sample-code-ignore-below
  });
}
