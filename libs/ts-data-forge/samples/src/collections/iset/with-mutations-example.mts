// Example: src/collections/iset.mts (withMutations)
import { ISet } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const base = ISet.create<string>(['a', 'b']);

    const actions: readonly Readonly<
      { type: 'add'; key: string } | { type: 'delete'; key: string }
    >[] = [
      { type: 'add', key: 'c' },
      { type: 'delete', key: 'a' },
    ] as const;

    const mutated = base.withMutations(actions);

    assert.deepStrictEqual(Array.from(mutated), ['b', 'c']);

    assert.deepStrictEqual(Array.from(base), ['a', 'b']);

    // embed-sample-code-ignore-below
  });
}
