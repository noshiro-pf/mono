// Example: src/guard/has-key.mts (hasKey)
import { hasKey } from 'ts-data-forge';

// embed-sample-code-ignore-above
const maybeUser: { id?: number; name?: string } = { id: 42 };

if (hasKey(maybeUser, 'id')) {
  // `maybeUser` is now known to have an `id` property.
  assert.isTrue(maybeUser.id === 42);
} else {
  assert.fail();
}
