// Example: src/array/array-utils.mts (generateAsync)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const values = await Arr.generateAsync(async function* () {
  yield 'Ada';
  await Promise.resolve();
  yield 'Lovelace';
});

assert.deepStrictEqual(values, ['Ada', 'Lovelace']);
