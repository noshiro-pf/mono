import type { DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';

// `check:root:ts-expression-wrappers` reads every `ts.is…(` call in this module
// as an entry of the list below, and holds it to the list the repository's
// scripts read (`tools/scripts/lib/ts-expression-wrappers.mts`) less what the
// guard's `TOOLS_ONLY_PREDICATES` names: keep anything else out of this module.

/**
 * Whether `node` is a {@link TsTypeWrapper}. Takes a readonly or a mutable node;
 * a `ts.Node` is not a union, so it narrows to either form of a wrapper.
 */
export const isTsTypeWrapper = (
  node: DeepReadonly<ts.Node>,
): node is DeepReadonly<TsTypeWrapper> | TsTypeWrapper =>
  ts.isParenthesizedExpression(node) ||
  ts.isAsExpression(node) ||
  ts.isSatisfiesExpression(node) ||
  ts.isNonNullExpression(node) ||
  ts.isTypeAssertionExpression(node);

/**
 * `node` with every {@link TsTypeWrapper} around it taken off: the expression
 * whose value it is, `x` of `((x as A) satisfies B)!`. The compiler API
 * counterpart of `skipTypeWrappers`, typed `N | DeepReadonly<ts.Expression>`:
 * the compiler API's node types are interfaces, not unions, so the wrappers an
 * `N` may be cannot be picked out of it (a `ts.LeftHandSideExpression` may be
 * `(a + b)!`), and a wrapper's operand is a `ts.Expression`, typed readonly
 * whether `N` is or not (the two forms are assignable to each other).
 */
export const skipTsTypeWrappers = <N extends DeepReadonly<ts.Node>>(
  node: N,
): N | DeepReadonly<ts.Expression> =>
  isTsTypeWrapper(node) ? skipTsTypeWrappers(node.expression) : node;

/**
 * The TypeScript compiler API nodes of the four of `TypeWrapper` (`x as T`,
 * `x!`, `x satisfies T`, `<T>x`), and parentheses, which ESTree drops and the
 * compiler API keeps. For a rule that reads the program's own nodes through the
 * type checker, with the same `typescript` this package resolves, since a
 * node's kind is a number that may differ between versions.
 */
export type TsTypeWrapper =
  | ts.AsExpression
  | ts.NonNullExpression
  | ts.ParenthesizedExpression
  | ts.SatisfiesExpression
  | ts.TypeAssertion;
