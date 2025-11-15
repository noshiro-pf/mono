// Example: src/array/array-utils.mts (toUpdated)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const temperatures: number[] = [20, 21, 22];

const increased = Arr.toUpdated(temperatures, 1, (value) => value + 5);

const incrementLast = Arr.toUpdated<number>(
  2,
  (value) => value + 1,
)(temperatures);

assert.deepStrictEqual(increased, [20, 26, 22]);

assert.deepStrictEqual(incrementLast, [20, 21, 23]);
