// Example: src/guard/has-key.mts (hasKey)
import { hasKey } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const maybeUser: Readonly<{ id?: number; name?: string }> = {
      id: 42,
    } as const;

    if (hasKey(maybeUser, 'id')) {
      // `maybeUser` is now known to have an `id` property.
      assert.isTrue(maybeUser.id === 42);
    } else {
      assert.fail();
    }

    // embed-sample-code-ignore-below
  });
}
