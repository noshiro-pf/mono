// Example: src/collections/imap.mts (entries)
import { IMap } from 'ts-data-forge';

// embed-sample-code-ignore-above
const map = IMap.create([
  ['a', 1],
  ['b', 2],
]);

const entries = Array.from(map.entries());

assert.deepStrictEqual(entries, [
  ['a', 1],
  ['b', 2],
]);
