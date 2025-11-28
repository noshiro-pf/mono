// Example: src/functional/ternary-result/impl/ternary-result-is-ternary-result.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okValue = TernaryResult.ok('done');

const warnValue = TernaryResult.warn('done', 'retry later');

const notResult = { $$tag: 'ts-data-forge::Result.ok' };

assert.isTrue(TernaryResult.isTernaryResult(okValue));

assert.isTrue(TernaryResult.isTernaryResult(warnValue));

assert.isFalse(TernaryResult.isTernaryResult(notResult));
