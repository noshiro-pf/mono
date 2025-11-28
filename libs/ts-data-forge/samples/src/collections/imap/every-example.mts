// Example: src/collections/imap.mts (every)
import { IMap } from 'ts-data-forge';

// embed-sample-code-ignore-above
const map = IMap.create([
  ['a', 2],
  ['b', 4],
]);

const allEven = map.every((value) => value % 2 === 0);

const isNarrowed = map.every((value): value is 2 | 4 => value % 2 === 0);

assert.isTrue(allEven);

assert.isTrue(isNarrowed);
