// Example: src/collections/iset.mts (intersect)
import { ISet } from 'ts-data-forge';

// embed-sample-code-ignore-above
const left = ISet.create<string>(['x', 'y']);
const right = ISet.create<string>(['y', 'z']);

const shared = left.intersect(right);

assert.deepStrictEqual(Array.from(shared), ['y']);
