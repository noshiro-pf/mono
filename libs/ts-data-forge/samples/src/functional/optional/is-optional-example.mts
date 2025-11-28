// Example: src/functional/optional.mts (Optional.isOptional)
import { Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const maybeOptional = Optional.some('value');

const notOptional = { $$tag: 'ts-data-forge::Optional.some' };

assert.isTrue(Optional.isOptional(maybeOptional));

assert.isFalse(Optional.isOptional(notOptional));
