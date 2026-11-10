import * as ts from 'typescript';

/**
 * The TypeScript wrappers an expression can sit in without changing the value
 * it is: parentheses, `as`, `satisfies`, `!`, `<T>` and an instantiation
 * expression (`f<T>`). CLAUDE.md ("Lint rules") asks every reader of code to
 * see through all of them, so the scripts and the configs ask this one list,
 * and a wrapper TypeScript adds is added here once.
 *
 * A published package cannot import `tools/`, so the ESLint packages' `src/`
 * read `isTsTypeWrapper` / `skipTsTypeWrappers` from `eslint-rule-forge`
 * instead: the compiler API counterpart of its ESTree `TypeWrapper`, which
 * leaves out the instantiation expression as that list does.
 *
 * `check:root:ts-expression-wrappers` reads every `ts.is…(` call here as an
 * entry of the list, counts copies with it, and holds eslint-rule-forge's to it:
 * keep anything else out of this module. Add a wrapper TypeScript adds here and
 * to eslint-rule-forge, or, when ESTree's `TypeWrapper` has no counterpart, to
 * the guard's `TOOLS_ONLY_PREDICATES` instead. Sumi's checker keeps a list of
 * its own for `typescript-native` nodes (`isTransparent` in
 * `languages/sumi/checker/src/ast/node-helpers.mts`), which the guard does not
 * read: add it there too.
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
