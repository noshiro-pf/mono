// Example: src/functional/ternary-result/impl/ternary-result-unwrap-warn-or.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okValue = TernaryResult.ok('value');

assert.strictEqual(TernaryResult.unwrapWarnOr(okValue, 'warn'), 'warn');

const unwrapWarn = TernaryResult.unwrapWarnOr('fallback warn');

assert.strictEqual(unwrapWarn(TernaryResult.warn('value', 'slow')), 'slow');

assert.strictEqual(unwrapWarn(TernaryResult.err('err')), 'fallback warn');
