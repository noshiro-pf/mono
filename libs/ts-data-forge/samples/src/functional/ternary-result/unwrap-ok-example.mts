// Example: src/functional/ternary-result/impl/ternary-result-unwrap-ok.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okValue = TernaryResult.ok(3);

const warnValue = TernaryResult.warn(4, 'warn');

assert.strictEqual(TernaryResult.unwrapOk(okValue), 3);

assert.strictEqual(TernaryResult.unwrapOk(warnValue), 4);
