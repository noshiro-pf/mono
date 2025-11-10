// Example: src/functional/ternary-result/impl/ternary-result-is-warn.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const maybeWarn = TernaryResult.warn('value', 'check logs') as TernaryResult<
  string,
  string,
  string
>;

if (TernaryResult.isWarn(maybeWarn)) {
  assert.strictEqual(maybeWarn.value, 'value');
  assert.strictEqual(maybeWarn.warning, 'check logs');
}
