import * as ts from 'typescript';

/**
 * The TypeScript wrappers an expression can sit in without changing the value
 * it is: parentheses, `as`, `satisfies`, `!`, `<T>` and an instantiation
 * expression (`f<T>`). CLAUDE.md ("Lint rules") asks every reader of code to
 * see through all of them, so the scripts and the configs ask this one list,
 * and a wrapper TypeScript adds is added here once.
 *
 * `eslint-plugin-synstate` keeps a copy of its own: it is published, and cannot
 * import `tools/`.
 */
export const isExpressionWrapper = (node: ts.Node): node is ExpressionWrapper =>
  ts.isParenthesizedExpression(node) ||
  ts.isAsExpression(node) ||
  ts.isSatisfiesExpression(node) ||
  ts.isNonNullExpression(node) ||
  ts.isTypeAssertionExpression(node) ||
  ts.isExpressionWithTypeArguments(node);

/** `node` without the wrappers {@link isExpressionWrapper} names around it. */
export const skipExpressionWrappers = <const N extends ts.Node>(
  node: N,
): N | ts.Expression =>
  isExpressionWrapper(node) ? skipExpressionWrappers(node.expression) : node;

export type ExpressionWrapper =
  | ts.AsExpression
  | ts.ExpressionWithTypeArguments
  | ts.NonNullExpression
  | ts.ParenthesizedExpression
  | ts.SatisfiesExpression
  | ts.TypeAssertion;
