import * as tsm from 'ts-morph';

/**
 * Whether `node` is one of the TypeScript wrappers an expression can sit in
 * without changing the value it is: parentheses, `as`, `satisfies`, `!`, `<T>`
 * and an instantiation expression (`f<T>`).
 *
 * The ts-morph counterpart of the list the repository's scripts read
 * (`tools/scripts/lib/ts-expression-wrappers.mts`), which
 * `check:root:ts-expression-wrappers` holds this one to: a wrapper TypeScript
 * adds is added to both. The guard reads every `tsm.Node.is…(` call here as an
 * entry of the list, so keep anything else out of this module.
 */
export const isExpressionWrapper = (node: tsm.Node): boolean =>
  tsm.Node.isParenthesizedExpression(node) ||
  tsm.Node.isAsExpression(node) ||
  tsm.Node.isSatisfiesExpression(node) ||
  tsm.Node.isNonNullExpression(node) ||
  tsm.Node.isTypeAssertion(node) ||
  tsm.Node.isExpressionWithTypeArguments(node);

/**
 * Whether `node` is a wrapper that asserts the type of what it wraps: `as`,
 * `<T>` and `!`. Parentheses and an instantiation expression assert nothing,
 * and `satisfies` checks the type without changing it.
 */
export const isTypeAssertingWrapper = (node: tsm.Node): boolean =>
  tsm.Node.isAsExpression(node) ||
  tsm.Node.isTypeAssertion(node) ||
  tsm.Node.isNonNullExpression(node);
