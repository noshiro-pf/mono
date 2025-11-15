// Example: src/array/array-utils.mts (countBy)
import { Arr, Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const words = ['Ada', 'Grace', 'Alan', 'Barbara'] as const;

const counts = Arr.countBy(words, (word) => word[0]);

assert.deepStrictEqual(counts.get('A'), Optional.some(2));

assert.deepStrictEqual(counts.get('G'), Optional.some(1));

assert.deepStrictEqual(counts.get('B'), Optional.some(1));
