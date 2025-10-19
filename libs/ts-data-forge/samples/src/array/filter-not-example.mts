// Example: src/array/array-utils.mts (filterNot)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const names = ['Ada', 'Grace', 'Linus'] as const;

const notAda = Arr.filterNot(names, (name) => name === 'Ada');
const notShort = Arr.filterNot<string>((name) => name.length <= 4)(names);

assert.deepStrictEqual(notAda, ['Grace', 'Linus']);
assert.deepStrictEqual(notShort, ['Grace', 'Linus']);
