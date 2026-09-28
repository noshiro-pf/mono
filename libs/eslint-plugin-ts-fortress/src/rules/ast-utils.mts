import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

/**
 * `node` with every `as`, `satisfies`, `!` and `<T>` around it taken off: the
 * expression whose value it is. Judge syntax on what this returns, so that a
 * wrapper does not hide a pattern (`isString((x as R).a)`), and keep the
 * original node for fix text. See `docs/writing-lint-rules.md` at the
 * repository root.
 *
 * A copy of the helper in `eslint-config-typed`, which this package, published
 * on its own, cannot import.
 */
export const skipTypeWrappers = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): TSESTree.Node =>
  isTypeWrapper(node) ? skipTypeWrappers(node.expression) : node;

export const isTypeWrapper = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): node is TypeWrapper => TYPE_WRAPPERS.has(node.type);

export type TypeWrapper =
  | TSESTree.TSAsExpression
  | TSESTree.TSNonNullExpression
  | TSESTree.TSSatisfiesExpression
  | TSESTree.TSTypeAssertion;

const TYPE_WRAPPERS: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.TSAsExpression,
  AST_NODE_TYPES.TSNonNullExpression,
  AST_NODE_TYPES.TSSatisfiesExpression,
  AST_NODE_TYPES.TSTypeAssertion,
]);
