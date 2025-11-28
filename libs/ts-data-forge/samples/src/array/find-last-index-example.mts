// Example: src/array/array-utils.mts (findLastIndex)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const letters = ['a', 'b', 'c', 'b'];

const lastIndexOfB = Arr.findLastIndex(letters, (letter) => letter === 'b');

// eslint-disable-next-line unicorn/prefer-array-index-of
const notFound = Arr.findLastIndex<string>((letter) => letter === 'z')(letters);

assert.isTrue(lastIndexOfB === 3);

assert.isTrue(notFound === -1);
