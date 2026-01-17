// Example: src/collections/imap.mts (delete)
import { IMap, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const original = IMap.create([
      ['a', 1],
      ['b', 2],
    ]);

    const withoutB = original.delete('b');

    assert.deepStrictEqual(original.get('b'), Optional.some(2));

    assert.deepStrictEqual(withoutB.get('b'), Optional.none);

    assert.isTrue(original.size === 2);

    assert.isTrue(withoutB.size === 1);

    // embed-sample-code-ignore-below
  });
}
