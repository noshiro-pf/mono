// Example: src/functional/optional.mts (Optional.unwrapOr)
import { Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const withValue = Optional.some(5);

const withoutValue = Optional.none as Optional<number>;

assert.isTrue(Optional.unwrapOr(withValue, 0) === 5);

assert.isTrue(Optional.unwrapOr(withoutValue, 0) === 0);

const unwrapWithDefault = Optional.unwrapOr(10);

assert.isTrue(unwrapWithDefault(Optional.some(3)) === 3);

assert.isTrue(unwrapWithDefault(Optional.none) === 10);
