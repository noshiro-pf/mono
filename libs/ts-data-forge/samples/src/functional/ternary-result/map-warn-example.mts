// Example: src/functional/ternary-result/impl/ternary-result-map-warn.mts
import { TernaryResult } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const warnValue = TernaryResult.warn(2, 'slow');

    const mappedWarn = TernaryResult.mapWarn(
      warnValue,
      (warning) => `${warning}!`,
    );

    const okPassthrough = TernaryResult.mapWarn(
      TernaryResult.ok(3),
      (value: number) => value * 2,
    );

    assert.deepStrictEqual(mappedWarn, TernaryResult.warn(2, 'slow!'));

    assert.deepStrictEqual(okPassthrough, TernaryResult.ok(3));

    // embed-sample-code-ignore-below
  });
}
