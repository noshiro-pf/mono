// Example: src/array/array-utils.mts (map)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const numbers = [1, 2, 3] as const;

const doubled = Arr.map(numbers, (value) => value * 2);
const indexed = Arr.map<number, string>((value, index) => `${index}:${value}`)(
  numbers,
);

assert.deepStrictEqual(doubled, [2, 4, 6]);
assert.deepStrictEqual(indexed, ['0:1', '1:2', '2:3']);
