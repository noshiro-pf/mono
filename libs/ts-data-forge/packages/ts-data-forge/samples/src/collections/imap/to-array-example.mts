// Example: src/collections/imap.mts (toArray)
import { IMap } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const entries = [
      ['k1', 'v1'],
      ['k2', 'v2'],
    ] as const satisfies readonly (readonly [string, string])[];

    const map = IMap.create(entries);

    assert.deepStrictEqual(map.toArray(), [
      ['k1', 'v1'],
      ['k2', 'v2'],
    ]);

    // embed-sample-code-ignore-below
  });
}
