// Example: src/number/num.mts (Num.from)
import { Num } from 'ts-data-forge';

// embed-sample-code-ignore-above
const input = '123.45';

const result = Num.from(input);

assert(result === 123.45);
