// Example: src/functional/ternary-result/impl/ternary-result-unwrap-ok-or.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const errValue = TernaryResult.err('err');

assert.strictEqual(TernaryResult.unwrapOkOr(errValue, 0), 0);

const unwrapWithDefault = TernaryResult.unwrapOkOr('fallback');

assert.strictEqual(unwrapWithDefault(TernaryResult.ok(5)), 5);

assert.strictEqual(
  unwrapWithDefault(TernaryResult.warn('warn-value', 'warn')),
  'warn-value',
);
