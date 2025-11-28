// Example: src/collections/iset.mts (toRawSet)
import is from '@sindresorhus/is';
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const set = ISet.create(['alpha']);

const raw = set.toRawSet();

assert.isTrue(is.set(raw));

assert.isTrue(raw.has('alpha'));
