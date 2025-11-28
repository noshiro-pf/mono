// Example: src/functional/optional.mts (Optional.toNullable)
import { Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const someNumber = Optional.some(42);

const noneNumber = Optional.none as Optional<number>;

assert.isTrue(Optional.toNullable(someNumber) === 42);

assert.isTrue(Optional.toNullable(noneNumber) === undefined);
