// Example: src/functional/ternary-result/impl/ternary-result-is-ternary-result.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okValue = TernaryResult.ok('done');
const warnValue = TernaryResult.warn('done', 'retry later');
const notResult = { $$tag: 'ts-data-forge::Result.ok' };

assert.ok(TernaryResult.isTernaryResult(okValue));
assert.ok(TernaryResult.isTernaryResult(warnValue));
assert.ok(!TernaryResult.isTernaryResult(notResult));
