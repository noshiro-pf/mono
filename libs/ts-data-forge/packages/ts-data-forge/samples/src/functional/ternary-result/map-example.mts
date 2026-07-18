// Example: src/functional/ternary-result/impl/ternary-result-map.mts
import { TernaryResult } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const okNumber = TernaryResult.ok(5);

    const warnValue = TernaryResult.warn(5, 'slow');

    const errValue = TernaryResult.err('bad');

    const doubled = TernaryResult.map(okNumber, (value) => value * 2);

    const warnPassthrough = TernaryResult.map(
      warnValue,
      (value: number) => value * 2,
    );

    const errPassthrough = TernaryResult.map(
      errValue,
      (value: number) => value * 2,
    );

    assert.deepStrictEqual(doubled, TernaryResult.ok(10));

    assert.deepStrictEqual(warnPassthrough, TernaryResult.warn(10, 'slow'));

    assert.deepStrictEqual(errPassthrough, errValue);

    // embed-sample-code-ignore-below
  });
}
