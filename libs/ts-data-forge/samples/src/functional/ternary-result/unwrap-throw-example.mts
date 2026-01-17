// Example: src/functional/ternary-result/impl/ternary-result-unwrap-throw.mts
import { TernaryResult } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const okValue = TernaryResult.ok('ready');

    assert.strictEqual(TernaryResult.unwrapThrow(okValue), 'ready');

    assert.throws(
      () => TernaryResult.unwrapThrow(TernaryResult.warn('warn', 'warned')),
      /Expected Ok/u,
    );

    // embed-sample-code-ignore-below
  });
}
