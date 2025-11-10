// Example: src/functional/ternary-result/impl/ternary-result-ok.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const success = TernaryResult.ok({ id: 1 });

assert.deepStrictEqual(success, {
  $$tag: 'ts-data-forge::Result.ok',
  value: { id: 1 },
});
