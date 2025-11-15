// Example: src/collections/imap.mts (has)
import { IMap } from 'ts-data-forge';

// embed-sample-code-ignore-above
const map = IMap.create<'id' | 'enabled', number | boolean>([
  ['id', 42],
  ['enabled', true],
]);

assert.ok(map.has('id'));

assert.notOk(map.has('missing'));
