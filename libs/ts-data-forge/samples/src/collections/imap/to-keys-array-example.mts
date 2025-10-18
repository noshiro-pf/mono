// Example: src/collections/imap.mts (toKeysArray)
import { IMap } from 'ts-data-forge';

// embed-sample-code-ignore-above
const entries = [
  ['x', 10],
  ['y', 20],
] satisfies readonly (readonly [string, number])[];

const map = IMap.create(entries);

assert.deepStrictEqual(map.toKeysArray(), ['x', 'y']);
