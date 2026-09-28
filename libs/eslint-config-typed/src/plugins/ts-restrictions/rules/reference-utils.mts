import {
  AST_NODE_TYPES,
  ASTUtils,
  type TSESTree,
} from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';
import { isTypeWrapper, skipTypeWrappers } from '../../ast-utils/index.mjs';

/**
 * Whether two expressions name the same variable or property, as `x.y` and
 * `x['y']` do. Only identifiers, `this`, `super`, literals and member accesses
 * on them qualify; anything else (a call, say) is never the same. A type
 * wrapper changes no reference: `(x as T).y` and `x!.y` are `x.y`.
 */
export const isSameReference = (
  rawLeft: DeepReadonly<TSESTree.Node>,
  rawRight: DeepReadonly<TSESTree.Node>,
): boolean => {
  const left = isTypeWrapper(rawLeft) ? skipTypeWrappers(rawLeft) : rawLeft;

  const right = isTypeWrapper(rawRight) ? skipTypeWrappers(rawRight) : rawRight;

  if (
    left.type === AST_NODE_TYPES.Super ||
    left.type === AST_NODE_TYPES.ThisExpression
  ) {
    return right.type === left.type;
  }

  if (
    left.type === AST_NODE_TYPES.Identifier ||
    left.type === AST_NODE_TYPES.PrivateIdentifier
  ) {
    return right.type === left.type && right.name === left.name;
  }

  if (left.type === AST_NODE_TYPES.Literal) {
    return right.type === left.type && right.value === left.value;
  }

  if (
    left.type !== AST_NODE_TYPES.MemberExpression ||
    right.type !== AST_NODE_TYPES.MemberExpression
  ) {
    return false;
  }

  const name = staticPropertyName(left);

  return name === undefined
    ? left.computed === right.computed &&
        isSameReference(left.object, right.object) &&
        isSameReference(left.property, right.property)
    : name === staticPropertyName(right) &&
        isSameReference(left.object, right.object);
};

const staticPropertyName = (
  node: DeepReadonly<TSESTree.MemberExpression>,
): string | undefined => {
  if (!node.computed) {
    return node.property.type === AST_NODE_TYPES.PrivateIdentifier
      ? `#${node.property.name}`
      : node.property.name;
  }

  const value = ASTUtils.getStaticValue(asNode(node.property))?.value;

  // `x[0]` and `x['0']` name the same property.
  return typeof value === 'string'
    ? value
    : typeof value === 'number' || typeof value === 'bigint'
      ? value.toString()
      : undefined;
};

/**
 * The `@typescript-eslint/utils` helpers take mutable nodes; this module only
 * ever reads them.
 */
const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as T;
