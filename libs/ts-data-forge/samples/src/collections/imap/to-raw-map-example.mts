// Example: src/collections/imap.mts (toRawMap)
import is from '@sindresorhus/is';
import { IMap } from 'ts-data-forge';

// embed-sample-code-ignore-above
const entries = [['key', 1]] satisfies readonly (readonly [string, number])[];

const map = IMap.create(entries);

const raw = map.toRawMap();

assert.ok(is.map(raw));

assert(raw.get('key') === 1);
