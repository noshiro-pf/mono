// Example: src/collections/imap.mts (forEach)
import { IMap } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const map = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);

    const entries: (readonly [string, number])[] = [];

    for (const [key, value] of map.entries()) {
      entries.push([key, value]);
    }

    assert.deepStrictEqual(entries, [
      ['a', 1],
      ['b', 2],
    ]);

    // embed-sample-code-ignore-below
  });
}
