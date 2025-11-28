// Example: src/number/branded-types/int.mts (Int.add)
import { Int, asInt } from 'ts-data-forge';

// embed-sample-code-ignore-above
const sum = Int.add(asInt(12), asInt(8));

assert.isTrue(sum === 20);
