// Example: src/functional/optional.mts (Optional.unwrap)
import { Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const someString = Optional.some('text');

const noneString = Optional.none as Optional<string>;

assert.isTrue(Optional.unwrap(someString) === 'text');

assert.isTrue(Optional.unwrap(noneString) === undefined);
