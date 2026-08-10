// Example: src/collections/imap.mts (withMutations)
import { IMap, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const entries = [
      ['a', 1],
      ['b', 2],
    ] as const satisfies readonly (readonly ['a' | 'b' | 'c', number])[];

    const base = IMap.create<'a' | 'b' | 'c', number>(entries);

    const actions: readonly Readonly<
      | { type: 'set'; key: 'c'; value: number }
      | { type: 'update'; key: 'b'; updater: (value: number) => number }
      | { type: 'delete'; key: 'a' }
    >[] = [
      { type: 'set', key: 'c', value: 3 },
      { type: 'update', key: 'b', updater: (value) => value * 10 },
      { type: 'delete', key: 'a' },
    ] as const;

    const mutated = base.withMutations(actions);

    assert.deepStrictEqual(mutated.get('c'), Optional.some(3));

    assert.deepStrictEqual(mutated.get('b'), Optional.some(20));

    assert.deepStrictEqual(mutated.get('a'), Optional.none);

    assert.deepStrictEqual(base.get('b'), Optional.some(2));

    // embed-sample-code-ignore-below
  });
}
