import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import type { DeepReadonly } from 'ts-type-forge';

/**
 * `node` with every `as`, `satisfies`, `!` and `<T>` around it taken off: the
 * expression whose value it is. The rules on logical operators and ternaries
 * look through them, so that a wrapper neither hides a pattern
 * (`a ? (false satisfies boolean) : b`) nor vouches for a type
 * (`(n as unknown as boolean) ? true : b`, whose value is still a number).
 * A new rule should too: `docs/writing-lint-rules.md` at the repository root.
 */
export const skipTypeWrappers = (
  node: DeepReadonly<TSESTree.Expression>,
): DeepReadonly<TSESTree.Expression> =>
  isTypeWrapper(node) ? skipTypeWrappers(node.expression) : node;

export const isTypeWrapper = (
  node: DeepReadonly<TSESTree.Node>,
): node is TypeWrapper => TYPE_WRAPPERS.has(node.type);

export type TypeWrapper = DeepReadonly<
  | TSESTree.TSAsExpression
  | TSESTree.TSNonNullExpression
  | TSESTree.TSSatisfiesExpression
  | TSESTree.TSTypeAssertion
>;

const TYPE_WRAPPERS: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.TSAsExpression,
  AST_NODE_TYPES.TSNonNullExpression,
  AST_NODE_TYPES.TSSatisfiesExpression,
  AST_NODE_TYPES.TSTypeAssertion,
]);
