// Example: src/collections/imap.mts (toValuesArray)
import { IMap } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const entries = [
      ['x', 10],
      ['y', 20],
    ] as const satisfies readonly (readonly [string, number])[];

    const map = IMap.create(entries);

    assert.deepStrictEqual(map.toValuesArray(), [10, 20]);

    // embed-sample-code-ignore-below
  });
}
