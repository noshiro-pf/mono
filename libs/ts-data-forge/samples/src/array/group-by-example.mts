// Example: src/array/array-utils.mts (groupBy)
import { Arr, Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const animals = ['ant', 'bat', 'cat', 'dove'] as const;

const groupedByLength = Arr.groupBy(animals, (animal) => animal.length);

const groupedByFirstLetter = Arr.groupBy((animal: string) => animal[0])(
  animals,
);

assert.deepStrictEqual(
  groupedByLength.get(3),
  Optional.some(['ant', 'bat', 'cat'] as const),
);

assert.deepStrictEqual(
  groupedByLength.get(4),
  Optional.some(['dove'] as const),
);

assert.deepStrictEqual(groupedByLength.get(5), Optional.none);

assert.deepStrictEqual(
  groupedByFirstLetter.get('a'),
  Optional.some(['ant'] as const),
);

assert.deepStrictEqual(
  groupedByFirstLetter.get('d'),
  Optional.some(['dove'] as const),
);
