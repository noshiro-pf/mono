// Example: src/functional/ternary-result/impl/ternary-result-unwrap-warn-throw.mts
import { TernaryResult } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const warnValue = TernaryResult.warn('pending', 'check logs');

    assert.strictEqual(TernaryResult.unwrapWarnThrow(warnValue), 'check logs');

    assert.throws(
      () => TernaryResult.unwrapWarnThrow(TernaryResult.err('err')),
      /Expected Warn/u,
    );

    // embed-sample-code-ignore-below
  });
}
