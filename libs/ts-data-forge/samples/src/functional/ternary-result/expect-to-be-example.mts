// Example: src/functional/ternary-result/impl/ternary-result-expect-to-be.mts
import { TernaryResult } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', (): void => {
    // embed-sample-code-ignore-above
    const okValue = TernaryResult.ok('ready');

    assert.strictEqual(TernaryResult.expectToBe(okValue, 'missing'), 'ready');

    const expectResult = TernaryResult.expectToBe<string>('needs value');

    const throwTest = (): void => {
      expectResult(TernaryResult.err('oops'));
    };

    assert.throws(throwTest, /needs value/u);

    // embed-sample-code-ignore-below
  });
}
