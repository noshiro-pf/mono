// Example: src/functional/ternary-result/impl/ternary-result-unwrap-err.mts
import { TernaryResult } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const errValue = TernaryResult.err('fail');

    const okValue = TernaryResult.ok('value');

    assert.strictEqual(TernaryResult.unwrapErr(errValue), 'fail');

    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    assert.strictEqual(TernaryResult.unwrapErr(okValue), undefined);

    // embed-sample-code-ignore-below
  });
}
