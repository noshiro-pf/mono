// Example: src/functional/ternary-result/impl/ternary-result-zip.mts
import { TernaryResult } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const okPair = TernaryResult.zip(
      TernaryResult.ok('left'),
      TernaryResult.ok(1),
    );

    const warnPair = TernaryResult.zip(
      TernaryResult.warn('left', 'warn'),
      TernaryResult.ok(1),
    );

    const errPair = TernaryResult.zip(
      TernaryResult.ok('left'),
      TernaryResult.err('err'),
    );

    assert.deepStrictEqual(okPair, TernaryResult.ok(['left', 1] as const));

    assert.deepStrictEqual(
      warnPair,
      TernaryResult.warn(['left', 1] as const, 'warn'),
    );

    assert.deepStrictEqual(errPair, TernaryResult.err('err'));

    // embed-sample-code-ignore-below
  });
}
