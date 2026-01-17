// Example: src/array/array-utils.mts (find)
import { Arr, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const users = [
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' },
    ];

    const found = Arr.find(users, (user) => user.id === 2);

    const missing = Arr.find<{ id: number }>((user) => user.id === 3)(users);

    assert.deepStrictEqual(found, Optional.some({ id: 2, name: 'Grace' }));

    assert.deepStrictEqual(missing, Optional.none);

    // embed-sample-code-ignore-below
  });
}
