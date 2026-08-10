// Example: src/collections/imap.mts (has)
import { IMap } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const map = IMap.create<'id' | 'enabled', number | boolean>([
      ['id', 42],
      ['enabled', true],
    ]);

    assert.isTrue(map.has('id'));

    assert.isFalse(map.has('missing'));

    // embed-sample-code-ignore-below
  });
}
