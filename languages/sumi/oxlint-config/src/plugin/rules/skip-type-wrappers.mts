import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';

/**
 * `node` with every `as`, `satisfies`, `!` and `<T>` around it taken off: the
 * expression whose value it is. A rule that matches a callee or a literal
 * looks through them, so that `(Number satisfies NumberConstructor)('1')` is
 * still a call to `Number`. oxlint drops parentheses from the tree, so these
 * four are all there is to skip.
 *
 * The ESLint rules have the same helper
 * (`libs/eslint-config-typed/src/plugins/ast-utils/type-wrapper-utils.mts`),
 * whose internals this package does not import; the reasoning for both is in
 * `docs/writing-lint-rules.md` at the repository root.
 */
export const skipTypeWrappers = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> =>
  node.type === AST_NODE_TYPES.TSAsExpression ||
  node.type === AST_NODE_TYPES.TSNonNullExpression ||
  node.type === AST_NODE_TYPES.TSSatisfiesExpression ||
  node.type === AST_NODE_TYPES.TSTypeAssertion
    ? skipTypeWrappers(node.expression)
    : node;
