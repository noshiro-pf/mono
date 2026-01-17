// Example: src/functional/ternary-result/impl/ternary-result-err.mts
import { TernaryResult } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const failure = TernaryResult.err(new Error('missing data'));

    assert.strictEqual(failure.$$tag, 'ts-data-forge::Result.err');

    assert.isTrue(TernaryResult.isErr(failure));

    // embed-sample-code-ignore-below
  });
}
