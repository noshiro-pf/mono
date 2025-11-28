// Example: src/array/array-utils.mts (isArray)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const maybeArray: unknown = [1, 2, 3];

const maybeValue: unknown = 'Ada';

assert.isTrue(Arr.isArray(maybeArray));

assert.isFalse(Arr.isArray(maybeValue));

if (Arr.isArray(maybeArray)) {
  assert.deepStrictEqual(maybeArray, [1, 2, 3]);
}
