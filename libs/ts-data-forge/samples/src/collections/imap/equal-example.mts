// Example: src/collections/imap.mts (equal)
import { IMap } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const first = IMap.create<'a' | 'b', number>([
      ['a', 1],
      ['b', 2],
    ]);

    const second = IMap.create<'a' | 'b', number>([
      ['b', 2],
      ['a', 1],
    ]);

    const third = IMap.create<'a' | 'b', number>([
      ['a', 1],
      ['b', 3],
    ]);

    assert.isTrue(IMap.equal(first, second));

    assert.isFalse(IMap.equal(first, third));

    // embed-sample-code-ignore-below
  });
}
