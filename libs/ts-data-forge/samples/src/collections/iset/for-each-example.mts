// Example: src/collections/iset.mts (forEach)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const set = ISet.create(['alpha', 'beta']);

    const mut_collected: string[] = [];

    for (const value of set) {
      mut_collected.push(value);
    }

    assert.deepStrictEqual(mut_collected, ['alpha', 'beta']);

    // embed-sample-code-ignore-below
  });
}
