// Example: src/collections/imap.mts (map)
import { IMap } from 'ts-data-forge';

// embed-sample-code-ignore-above
const entries = [
  ['a', 1],
  ['b', 2],
] satisfies readonly (readonly [string, number])[];

const map = IMap.create(entries);

const doubled = map.map((value) => value * 2);

assert.deepStrictEqual(Array.from(doubled), [
  ['a', 2],
  ['b', 4],
]);
