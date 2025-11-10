// Example: src/functional/ternary-result/impl/ternary-result-or-else.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const fallback = TernaryResult.ok('fallback');

assert.deepStrictEqual(
  TernaryResult.orElse(TernaryResult.ok('value'), fallback),
  TernaryResult.ok('value'),
);
assert.deepStrictEqual(
  TernaryResult.orElse(TernaryResult.warn('value', 'warn'), fallback),
  TernaryResult.warn('value', 'warn'),
);
assert.deepStrictEqual(
  TernaryResult.orElse(TernaryResult.err('err'), fallback),
  fallback,
);
