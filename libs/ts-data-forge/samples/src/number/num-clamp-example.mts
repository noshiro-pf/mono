// Example: src/number/num.mts (Num.clamp)
import { Num } from 'ts-data-forge';

// embed-sample-code-ignore-above
assert(Num.clamp(150, 0, 100) === 100);
assert(Num.clamp(-50, 0, 100) === 0);

const clampToPercentage = Num.clamp(0, 100);

assert(clampToPercentage(75) === 75);
assert(clampToPercentage(150) === 100);
