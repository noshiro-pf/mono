// Example: src/collections/imap.mts (size)
import { IMap } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const entries = [
      ['a', 1],
      ['b', 2],
    ] satisfies readonly (readonly [string, number])[];

    const map = IMap.create(entries);

    assert.isTrue(map.size === 2);

    // embed-sample-code-ignore-below
  });
}
