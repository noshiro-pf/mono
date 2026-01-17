// Example: src/collections/imap.mts (get)
import { IMap, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const map = IMap.create([['user', { id: 1 }]]);

    assert.deepStrictEqual(map.get('user'), Optional.some({ id: 1 }));

    assert.deepStrictEqual(map.get('missing'), Optional.none);

    // embed-sample-code-ignore-below
  });
}
