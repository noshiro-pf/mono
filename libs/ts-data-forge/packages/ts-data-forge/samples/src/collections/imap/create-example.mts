// Example: src/collections/imap.mts (create)
import { IMap, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const map = IMap.create<string, number | string>([
      ['id', 1],
      ['status', 'active'],
    ]);

    assert.isTrue(map.size === 2);

    assert.deepStrictEqual(map.get('status'), Optional.some('active'));

    // embed-sample-code-ignore-below
  });
}
