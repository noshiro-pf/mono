import { asUint32, range } from 'ts-data-forge';

const parenDepthDelta = (char: string | undefined): number => {
  switch (char) {
    case '(':
      return 1;

    case ')':
      return -1;

    // `at` returns `undefined` past the end of the string. The loop below
    // never asks for such an index, but the type says it can.
    case undefined:
    default:
      return 0;
  }
};

/**
 * Checks if a string is already wrapped with a single pair of balanced
 * parentheses that encompasses the entire expression.
 *
 * `'(A)'` and `'((A))'` are wrapped — in the second the outer pair still spans
 * everything — while `'A'` is not, and neither is `'(A) | (B)'`, whose first
 * parenthesis closes before the end.
 *
 * Module-local, so `samples/` — which imports the package the way a consumer
 * does — cannot reach it, and it therefore carries no `@example`. See
 * {@link wrapWithParentheses}, the exported form, whose example covers the
 * same cases.
 */
const isWrappedWithParentheses = (str: string): boolean => {
  const trimmed = str.trim();

  if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) {
    return false;
  }

  // Check if the opening and closing parentheses are balanced
  // and the opening parenthesis corresponds to the closing one
  let mut_depth = 0;

  for (const mut_i of range(0, asUint32(trimmed.length))) {
    mut_depth += parenDepthDelta(trimmed.at(mut_i));

    // If we reach depth 0 before the end, the outer parentheses don't wrap everything
    if (mut_depth === 0 && mut_i < trimmed.length - 1) {
      return false;
    }
  }

  return true;
};

/**
 * Wraps a string with parentheses if not already wrapped.
 * Avoids adding redundant parentheses when the expression is already
 * fully wrapped with balanced parentheses.
 *
 * @example
 *
 * ```ts
 * assert.deepStrictEqual(wrapWithParentheses('A'), '(A)');
 *
 * // already wrapped, so not '((A))'
 * assert.deepStrictEqual(wrapWithParentheses('(A)'), '(A)');
 *
 * assert.deepStrictEqual(wrapWithParentheses('A | B'), '(A | B)');
 *
 * assert.deepStrictEqual(wrapWithParentheses('(A | B)'), '(A | B)');
 *
 * // the outer parentheses do not span everything, so a pair is added
 * assert.deepStrictEqual(wrapWithParentheses('(A) | (B)'), '((A) | (B))');
 * ```
 */
export const wrapWithParentheses = (nodeStr: string): string => {
  const trimmed = nodeStr.trim();

  if (isWrappedWithParentheses(trimmed)) {
    return trimmed;
  }

  return `(${trimmed})` as const;
};
