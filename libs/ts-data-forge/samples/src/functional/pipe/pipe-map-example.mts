// Example: src/functional/pipe.mts (pipe map)
import { pipe } from 'ts-data-forge';

// embed-sample-code-ignore-above
const result = pipe(2)
  .map((value) => value * 3)
  .map((value) => `value: ${value}`);

assert.deepStrictEqual(result.value, 'value: 6');
