// Example: src/array/array-utils.mts (isNonEmpty)
import { Arr } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const users: readonly Readonly<{ id: number }>[] = [{ id: 1 }];

    const emptyUsers: readonly Readonly<{ id: number }>[] = [];

    assert.isTrue(Arr.isNonEmpty(users));

    assert.isFalse(Arr.isNonEmpty(emptyUsers));

    if (Arr.isNonEmpty(users)) {
      assert.deepStrictEqual(users[0], { id: 1 });
    }

    // embed-sample-code-ignore-below
  });
}
