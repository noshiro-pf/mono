// Example: src/array/array-utils.mts (generate)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const numbers = Arr.generate(function* () {
  yield 1;

  yield 2;

  yield 3;
});

assert.deepStrictEqual(numbers, [1, 2, 3]);
