import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';

/**
 * Where `node`'s value ends up in JSX, if it does: rendered as a child, or
 * passed as an attribute's value.
 *
 * The value of `node` is the value of the `{…}` around it when every step up
 * passes it through unchanged — a branch of a ternary (not its test), an
 * operand of `&&` / `||` / `??`, or a type-only wrapper. `{a ? b : c}` puts
 * `b` and `c` in JSX, and `{(a && b) || c}` puts `a`, `b` and `c` there, since
 * each can be the value that comes out. The test of a ternary never is.
 */
export const jsxValuePositionOf = (
  node: DeepReadonly<TSESTree.Node>,
): JsxValuePosition | undefined => {
  const { parent } = node;

  if (parent === undefined) {
    return undefined;
  }

  if (parent.type === AST_NODE_TYPES.JSXExpressionContainer) {
    return parent.parent.type === AST_NODE_TYPES.JSXAttribute
      ? 'attribute'
      : 'child';
  }

  return passesValueThrough(parent, node)
    ? jsxValuePositionOf(parent)
    : undefined;
};

export type JsxValuePosition = 'attribute' | 'child';

const passesValueThrough = (
  parent: DeepReadonly<TSESTree.Node>,
  child: DeepReadonly<TSESTree.Node>,
): boolean =>
  parent.type === AST_NODE_TYPES.ConditionalExpression
    ? parent.test !== child
    : VALUE_PASSING_TYPES.has(parent.type);

const VALUE_PASSING_TYPES: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.LogicalExpression,
  AST_NODE_TYPES.TSAsExpression,
  AST_NODE_TYPES.TSNonNullExpression,
  AST_NODE_TYPES.TSSatisfiesExpression,
]);
