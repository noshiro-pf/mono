// Example: src/collections/iset.mts (toRawSet)
import is from '@sindresorhus/is';
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const set = ISet.create(['alpha']);

const raw = set.toRawSet();

assert.ok(is.set(raw));

assert.ok(raw.has('alpha'));
