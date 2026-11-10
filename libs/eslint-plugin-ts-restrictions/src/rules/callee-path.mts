import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { skipTypeWrappers } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';

// How a callee is named at a call, shared by the rules that match callees by a
// dotted path (`Date.parse`, `DateUtils.from`).

/**
 * The name of the member `node` reads: `a.b`, `a['b']` and ``a[`b`]`` are `b`.
 */
export const memberName = (
  node: DeepReadonly<TSESTree.MemberExpression>,
): string | undefined =>
  !node.computed && node.property.type === AST_NODE_TYPES.Identifier
    ? node.property.name
    : node.computed
      ? staticString(node.property)
      : undefined;

/**
 * `node` read through its type wrappers and an optional chain around them:
 * `(Date?.parse)` is `Date.parse` wherever it is not `undefined`.
 */
export const unwrapCallee = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> => {
  const unwrapped = skipTypeWrappers(node);

  return unwrapped.type === AST_NODE_TYPES.ChainExpression
    ? skipTypeWrappers(unwrapped.expression)
    : unwrapped;
};

/**
 * `node` as a dotted path of names (`globalThis.Date`, `DateUtils.from`), read
 * through type wrappers, optional chains and string-keyed computed members, or
 * `undefined` for anything else.
 */
export const namePath = (
  node: DeepReadonly<TSESTree.Node>,
): string | undefined => {
  const value = unwrapCallee(node);

  if (value.type === AST_NODE_TYPES.Identifier) {
    return value.name;
  }

  if (value.type !== AST_NODE_TYPES.MemberExpression) {
    return undefined;
  }

  const object = namePath(value.object);

  const name = memberName(value);

  return object === undefined || name === undefined
    ? undefined
    : `${object}.${name}`;
};

/** The value of a string literal or a template literal with no substitution. */
const staticString = (
  node: DeepReadonly<TSESTree.Node>,
): string | undefined => {
  const value = skipTypeWrappers(node);

  if (value.type === AST_NODE_TYPES.Literal) {
    return typeof value.value === 'string' ? value.value : undefined;
  }

  return value.type === AST_NODE_TYPES.TemplateLiteral &&
    Arr.isEmpty(value.expressions)
    ? (value.quasis[0]?.value.cooked ?? undefined)
    : undefined;
};
