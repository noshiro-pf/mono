// Example: src/functional/ternary-result/impl/ternary-result-warn.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const caution = TernaryResult.warn({ id: 1 }, 'Needs review');

assert.deepStrictEqual(caution, {
  $$tag: 'ts-data-forge::Result.warn',
  value: { id: 1 },
  warning: 'Needs review',
});
