// Example: src/collections/iset.mts (filter)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const letters = ISet.create(['apple', 'bee', 'cat']);

const shortWords = letters.filter((value) => value.length <= 3);

const narrowed = letters.filter(
  (value): value is 'bee' | 'cat' => value.length === 3,
);

assert.deepStrictEqual(Array.from(shortWords), ['bee', 'cat']);

assert.deepStrictEqual(Array.from(narrowed), ['bee', 'cat']);
