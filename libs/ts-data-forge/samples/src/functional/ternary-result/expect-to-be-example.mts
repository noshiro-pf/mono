// Example: src/functional/ternary-result/impl/ternary-result-expect-to-be.mts
import { TernaryResult } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const okValue = TernaryResult.ok('ready');

    assert.strictEqual(TernaryResult.expectToBe(okValue, 'missing'), 'ready');

    const expectResult = TernaryResult.expectToBe<string>('needs value');

    assert.throws(
      () => expectResult(TernaryResult.err('oops')),
      /needs value/u,
    );

    // embed-sample-code-ignore-below
  });
}
