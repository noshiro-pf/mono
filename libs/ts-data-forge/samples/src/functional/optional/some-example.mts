// Example: src/functional/optional.mts (Optional.some / Optional.none)
import { Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const someValue = Optional.some({ id: 1 });
const noneValue = Optional.none;

assert.ok(Optional.isSome(someValue));
assert.ok(Optional.isNone(noneValue));
