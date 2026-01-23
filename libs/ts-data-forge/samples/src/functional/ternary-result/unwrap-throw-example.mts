// Example: src/functional/ternary-result/impl/ternary-result-unwrap-throw.mts
import { TernaryResult } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', (): void => {
    // embed-sample-code-ignore-above
    const okValue = TernaryResult.ok('ready');

    assert.strictEqual(TernaryResult.unwrapThrow(okValue), 'ready');

    const throwTest = (): void => {
      TernaryResult.unwrapThrow(TernaryResult.warn('warn', 'warned'));
    };

    assert.throws(throwTest, /Expected Ok/u);

    // embed-sample-code-ignore-below
  });
}
