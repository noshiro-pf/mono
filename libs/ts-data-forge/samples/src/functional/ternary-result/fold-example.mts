// Example: src/functional/ternary-result/impl/ternary-result-fold.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okFold = TernaryResult.fold(
  TernaryResult.ok(2),
  (value) => value * 2,
  (warn: string) => warn.length,
  (error: string) => error.toUpperCase(),
);
const warnFold = TernaryResult.fold(
  TernaryResult.warn(2, 'spike'),
  (value: number) => value,
  (warn: string) => warn.toUpperCase(),
  (error: string) => error,
);

assert.deepStrictEqual(okFold, TernaryResult.ok(4));
assert.deepStrictEqual(warnFold, TernaryResult.warn(2, 'SPIKE'));
