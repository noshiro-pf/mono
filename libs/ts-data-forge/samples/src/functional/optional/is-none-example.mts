// Example: src/functional/optional.mts (Optional.isNone)
import { Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const optionalValue = Optional.none as Optional<number>;

if (Optional.isNone(optionalValue)) {
  // Type narrowed to None
  assert.isTrue(true); // optionalValue is None
}
