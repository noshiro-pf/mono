// Example: src/array/array-utils.mts (isEmpty)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const emptyNumbers: readonly number[] = [] as const;

const words = ['Ada', 'Lovelace'] as const;

assert.ok(Arr.isEmpty(emptyNumbers));

assert.notOk(Arr.isEmpty(words));

if (Arr.isEmpty(emptyNumbers)) {
  assert.deepStrictEqual(emptyNumbers, []);
}
