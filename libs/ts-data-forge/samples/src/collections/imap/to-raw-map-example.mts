// Example: src/collections/imap.mts (toRawMap)
import { isMap } from '@sindresorhus/is';
import { IMap } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const entries = [['key', 1]] satisfies readonly (readonly [
      string,
      number,
    ])[];

    const map = IMap.create(entries);

    const raw = map.toRawMap();

    assert.isTrue(isMap(raw));

    assert.isTrue(raw.get('key') === 1);

    // embed-sample-code-ignore-below
  });
}
