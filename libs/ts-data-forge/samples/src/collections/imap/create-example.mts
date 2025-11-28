// Example: src/collections/imap.mts (create)
import { IMap, Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const map = IMap.create<string, number | string>([
  ['id', 1],
  ['status', 'active'],
]);

assert.isTrue(map.size === 2);

assert.deepStrictEqual(map.get('status'), Optional.some('active'));
