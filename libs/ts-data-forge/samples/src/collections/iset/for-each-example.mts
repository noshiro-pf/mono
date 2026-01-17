// Example: src/collections/iset.mts (forEach)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const set = ISet.create(['alpha', 'beta']);

    const collected: string[] = [];

    for (const value of set) {
      collected.push(value);
    }

    assert.deepStrictEqual(collected, ['alpha', 'beta']);

    // embed-sample-code-ignore-below
  });
}
