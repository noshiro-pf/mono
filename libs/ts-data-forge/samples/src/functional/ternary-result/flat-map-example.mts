// Example: src/functional/ternary-result/impl/ternary-result-flat-map.mts
import { TernaryResult } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const parse = (value: string): TernaryResult<number, string, string> =>
      Number.isNaN(Number(value))
        ? TernaryResult.err('NaN')
        : TernaryResult.ok(Number(value));

    const doubled = TernaryResult.flatMap(TernaryResult.ok('3'), (text) =>
      TernaryResult.map(parse(text), (num) => num * 2),
    );

    const warnPassthrough = TernaryResult.flatMap(
      TernaryResult.warn('3', 'retry'),
      parse,
    );

    const errPassthrough = TernaryResult.flatMap(
      TernaryResult.err('oops'),
      parse,
    );

    assert.deepStrictEqual(doubled, TernaryResult.ok(6));

    assert.deepStrictEqual(warnPassthrough, TernaryResult.warn(3, 'retry'));

    assert.deepStrictEqual(errPassthrough, TernaryResult.err('oops'));

    // embed-sample-code-ignore-below
  });
}
