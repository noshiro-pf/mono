// Example: src/object/object.mts (map)
import { Obj } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const scores = { alice: 1, bob: 2 } as const;

    const doubled = Obj.map(scores, (value) => value * 2);

    assert.deepStrictEqual(doubled, { alice: 2, bob: 4 });

    // The key is available as the second argument.
    const labelled = Obj.map(scores, (value, key) => `${key}=${value}`);

    assert.deepStrictEqual(labelled, { alice: 'alice=1', bob: 'bob=2' });

    // embed-sample-code-ignore-below
  });
}
