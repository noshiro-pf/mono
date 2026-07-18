// Example: src/functional/ternary-result/impl/ternary-result-unwrap-err-throw.mts
import { TernaryResult } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const errValue = TernaryResult.err('boom');

    assert.strictEqual(TernaryResult.unwrapErrThrow(errValue), 'boom');

    assert.throws(
      () => TernaryResult.unwrapErrThrow(TernaryResult.ok('value')),
      /Expected Err/u,
    );

    // embed-sample-code-ignore-below
  });
}
