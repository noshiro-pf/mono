// Example: src/functional/ternary-result/impl/ternary-result-to-optional.mts
import { Optional, TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okValue = TernaryResult.ok(7);
const warnValue = TernaryResult.warn(7, 'warn');

assert.deepStrictEqual(TernaryResult.toOptional(okValue), Optional.some(7));
assert.deepStrictEqual(TernaryResult.toOptional(warnValue), Optional.some(7));
