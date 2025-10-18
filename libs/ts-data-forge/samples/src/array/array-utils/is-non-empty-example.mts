// Example: src/array/array-utils.mts (isNonEmpty)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const users: readonly { id: number }[] = [{ id: 1 }];
const emptyUsers: readonly { id: number }[] = [];

assert.ok(Arr.isNonEmpty(users));
assert.notOk(Arr.isNonEmpty(emptyUsers));

if (Arr.isNonEmpty(users)) {
  assert.deepStrictEqual(users[0], { id: 1 });
}
