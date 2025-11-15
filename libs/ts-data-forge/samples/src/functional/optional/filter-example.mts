// Example: src/functional/optional.mts (Optional.filter)
import { Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const even = Optional.filter(Optional.some(4), (value) => value % 2 === 0);

const odd = Optional.filter(Optional.some(3), (value) => value % 2 === 0);

assert.deepStrictEqual(even, Optional.some(4));

assert.deepStrictEqual(odd, Optional.none);

const filterEven = Optional.filter((value: number) => value % 2 === 0);

assert.deepStrictEqual(filterEven(Optional.some(6)), Optional.some(6));

assert.deepStrictEqual(filterEven(Optional.some(5)), Optional.none);
