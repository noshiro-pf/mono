// Example: src/functional/ternary-result/impl/ternary-result-unwrap-warn.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const warnValue = TernaryResult.warn('ok', 'careful');
const okValue = TernaryResult.ok('ok');

assert.strictEqual(TernaryResult.unwrapWarn(warnValue), 'careful');
// eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
assert.strictEqual(TernaryResult.unwrapWarn(okValue), undefined);
