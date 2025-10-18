// Example: src/collections/imap.mts (some)
import { IMap } from 'ts-data-forge';

// embed-sample-code-ignore-above
const entries = [
  ['alice', 3],
  ['bob', 5],
] satisfies readonly (readonly [string, number])[];

const map = IMap.create(entries);

assert.ok(map.some((value) => value > 4));
assert.notOk(map.some((value) => value > 10));
