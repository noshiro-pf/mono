// Example: src/array/array-utils.mts (head)
import { Arr, Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const users = [{ id: 1 }, { id: 2 }];
const empty: { id: number }[] = [];

const first = Arr.head(users);
const none = Arr.head(empty);

assert.deepStrictEqual(first, Optional.some({ id: 1 }));
assert.deepStrictEqual(none, Optional.none);
