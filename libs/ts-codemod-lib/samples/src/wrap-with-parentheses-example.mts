// Example: src/functions/functions/wrap-with-parentheses.mts (wrapWithParentheses)
import { wrapWithParentheses } from 'ts-codemod-lib';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    assert.deepStrictEqual(wrapWithParentheses('A'), '(A)');

    // already wrapped, so not '((A))'
    assert.deepStrictEqual(wrapWithParentheses('(A)'), '(A)');

    assert.deepStrictEqual(wrapWithParentheses('A | B'), '(A | B)');

    assert.deepStrictEqual(wrapWithParentheses('(A | B)'), '(A | B)');

    // the outer parentheses do not span everything, so a pair is added
    assert.deepStrictEqual(wrapWithParentheses('(A) | (B)'), '((A) | (B))');

    // embed-sample-code-ignore-below
  });
}
