// Example: src/collections/iset.mts (toRawSet)
import { isSet } from '@sindresorhus/is';
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const set = ISet.create(['alpha']);

const raw = set.toRawSet();

assert.isTrue(isSet(raw));

assert.isTrue(raw.has('alpha'));
