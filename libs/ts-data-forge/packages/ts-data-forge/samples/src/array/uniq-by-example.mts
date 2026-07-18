// Example: src/array/array-utils.mts (uniqBy)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const people = [
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Brian' },
      { id: 1, name: 'Alan' },
      { id: 3, name: 'Grace' },
    ] as const;

    const uniqueById = Arr.uniqBy(people, (person) => person.id);

    const expected = [
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Brian' },
      { id: 3, name: 'Grace' },
    ] as const;

    assert.deepStrictEqual(uniqueById, expected);

    // embed-sample-code-ignore-below
  });
}
