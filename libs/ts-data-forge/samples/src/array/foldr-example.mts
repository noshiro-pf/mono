// Example: src/array/array-utils.mts (foldr)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const numbers = [1, 2, 3];

const subtractRight = Arr.foldr(numbers, (acc, value) => acc - value, 0);

const joinFromRight = Arr.foldr<number, string>(
  (acc, value) => `${acc}${value}`,
  '',
)(numbers);

assert.isTrue(subtractRight === -6);

assert.isTrue(joinFromRight === '321');
