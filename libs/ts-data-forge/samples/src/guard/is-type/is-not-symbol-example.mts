// Example: src/guard/is-type.mts (isNotSymbol)
import { isNotSymbol } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const id = Symbol('id');

    const tokens: unknown[] = [id, 'shared'];

    const nonSymbols = tokens.filter(isNotSymbol);

    assert.deepStrictEqual(nonSymbols, ['shared']);

    // embed-sample-code-ignore-below
  });
}
