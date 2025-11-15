// Example: src/array/array-utils.mts (count)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const words = ['Ada', 'Grace', 'Linus'] as const;

const longWords = Arr.count(words, (word) => word.length > 4);

const withCurried = Arr.count<string>((word) => word.includes('a'))(words);

assert(longWords === 2);

assert(withCurried === 2);
