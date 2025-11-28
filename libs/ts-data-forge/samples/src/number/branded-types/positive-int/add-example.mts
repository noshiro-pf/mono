// Example: src/number/branded-types/positive-int.mts (PositiveInt.add)
import { PositiveInt, asPositiveInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const sum = PositiveInt.add(asPositiveInt(4), asPositiveInt(5));

assert.isTrue(sum === 9);
