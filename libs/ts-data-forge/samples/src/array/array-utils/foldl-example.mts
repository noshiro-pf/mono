// Example: src/array/array-utils.mts (foldl)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const words = ['Ada', 'Lovelace'];

const totalLength = Arr.foldl(words, (acc, word) => acc + word.length, 0);
const concat = Arr.foldl<string | number, string>(
  (acc, value) => `${acc}-${value}`,
  'items',
)(words);

assert(totalLength === 11);
assert(concat === 'items-Ada-Lovelace');
