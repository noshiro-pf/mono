// Example: src/object/object.mts (filterMap)
import { Obj, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const scores = { alice: 1, bob: 2 } as const;

    // `Optional.some` keeps an entry with a new value, `Optional.none` drops it.
    const labelled = Obj.filterMap(scores, (value, key) =>
      value > 1 ? Optional.some(`${key}=${value}`) : Optional.none,
    );

    assert.deepStrictEqual(labelled, { bob: 'bob=2' });

    // embed-sample-code-ignore-below
  });
}
