// Example: src/functional/optional.mts (Optional.orElse)
import { Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const preferred = Optional.some('primary');

const fallback = Optional.some('secondary');

const noneValue = Optional.none as Optional<string>;

assert.deepStrictEqual(Optional.orElse(preferred, fallback), preferred);

assert.deepStrictEqual(Optional.orElse(noneValue, fallback), fallback);

const orElseFallback = Optional.orElse(Optional.some('default'));

assert.deepStrictEqual(orElseFallback(Optional.none), Optional.some('default'));

assert.deepStrictEqual(
  orElseFallback(Optional.some('value')),
  Optional.some('value'),
);
