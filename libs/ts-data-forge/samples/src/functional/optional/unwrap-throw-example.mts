// Example: src/functional/optional.mts (Optional.unwrapThrow)
import { Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const present = Optional.some('available');

assert(Optional.unwrapThrow(present) === 'available');
assert.throws(
  () => Optional.unwrapThrow(Optional.none),
  /has failed because it is `None`/u,
);
