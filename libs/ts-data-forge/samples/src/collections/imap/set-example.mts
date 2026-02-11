// Example: src/collections/imap.mts (set)
import { IMap, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const entries = [['count', 1]] as const satisfies readonly (readonly [
      'count' | 'status',
      number | string,
    ])[];

    const base = IMap.create<'count' | 'status', number | string>(entries);

    const updated = base.set('count', 2);

    const extended = base.set('status', 'ok');

    assert.deepStrictEqual(base.get('count'), Optional.some(1));

    assert.deepStrictEqual(updated.get('count'), Optional.some(2));

    assert.deepStrictEqual(extended.get('status'), Optional.some('ok'));

    // embed-sample-code-ignore-below
  });
}
