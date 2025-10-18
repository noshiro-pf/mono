// Example: src/functional/optional.mts (Optional.expectToBe)
import { Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const optionalValue = Optional.some('data');

assert(Optional.expectToBe(optionalValue, 'value expected') === 'data');

const expectValue = Optional.expectToBe<string>('missing optional');

assert.throws(() => expectValue(Optional.none), /missing optional/u);
assert(expectValue(Optional.some('present')) === 'present');
