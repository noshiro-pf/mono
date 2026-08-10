/**
 * Checks if a string is already wrapped with a single pair of balanced parentheses
 * that encompasses the entire expression.
 *
 * @example
 * isWrappedWithParentheses('(A)') // true
 * isWrappedWithParentheses('((A))') // true (outer pair wraps everything)
 * isWrappedWithParentheses('(A) | (B)') // false (outer parens don't wrap everything)
 * isWrappedWithParentheses('A') // false
 */
import { asUint32, range } from 'ts-data-forge';

const parenDepthDelta = (char: string): number => {
  switch (char) {
    case '(':
      return 1;

    case ')':
      return -1;

    default:
      return 0;
  }
};

const isWrappedWithParentheses = (str: string): boolean => {
  const trimmed = str.trim();

  if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) {
    return false;
  }

  // Check if the opening and closing parentheses are balanced
  // and the opening parenthesis corresponds to the closing one
  let mut_depth = 0;

  for (const mut_i of range(0, asUint32(trimmed.length))) {
    mut_depth += parenDepthDelta(trimmed.charAt(mut_i));

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
 * wrapWithParentheses('A') // '(A)'
 * wrapWithParentheses('(A)') // '(A)' (not '((A))')
 * wrapWithParentheses('A | B') // '(A | B)'
 * wrapWithParentheses('(A | B)') // '(A | B)' (not '((A | B))')
 * wrapWithParentheses('(A) | (B)') // '((A) | (B))' (needs outer parens)
 */
export const wrapWithParentheses = (nodeStr: string): string => {
  const trimmed = nodeStr.trim();

  if (isWrappedWithParentheses(trimmed)) {
    return trimmed;
  }

  return `(${trimmed})` as const;
};
