// Example: src/functional/ternary-result/impl/ternary-result-unwrap-err-or.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okValue = TernaryResult.ok('value');

assert.strictEqual(TernaryResult.unwrapErrOr(okValue, 'default'), 'default');
const unwrapErr = TernaryResult.unwrapErrOr('fallback error');

assert.strictEqual(unwrapErr(TernaryResult.err('boom')), 'boom');
assert.strictEqual(
  unwrapErr(TernaryResult.warn('value', 'warn')),
  'fallback error',
);
