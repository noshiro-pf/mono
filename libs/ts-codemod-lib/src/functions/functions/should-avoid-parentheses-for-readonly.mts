import * as tsm from 'ts-morph';

/**
 * Determines if parentheses should be avoided when adding 'readonly' prefix to a type.
 *
 * Parentheses should be AVOIDED in these specific contexts:
 * - Type predicates: `x is [T, U]` -> `x is readonly [T, U]` (not `x is (readonly [T, U])`)
 *   because parentheses around the type in a type predicate cause syntax errors
 *
 * For all other contexts, we keep parentheses for safety to avoid precedence issues,
 * relying on prettier to remove unnecessary ones.
 *
 * @param node - The type node to check
 * @returns true if parentheses should be avoided, false otherwise (keep parentheses)
 */
export const shouldAvoidParenthesesForReadonly = (node: tsm.Node): boolean => {
  const parent = node.getParent();

  if (parent === undefined) {
    return false;
  }

  // Check if parent is TypePredicate: x is T
  // In this case, we MUST avoid parentheses: x is readonly T (not x is (readonly T))
  // because `x is (readonly T)` is a syntax error
  if (parent.isKind(tsm.SyntaxKind.TypePredicate)) {
    return true;
  }

  // For all other cases, keep parentheses for safety
  return false;
};
