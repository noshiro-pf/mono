import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

export const isReactMemberExpression = (
  node: DeepReadonly<TSESTree.MemberExpression>,
  propertyName: string,
): boolean =>
  node.object.type === AST_NODE_TYPES.Identifier &&
  node.object.name === 'React' &&
  node.property.type === AST_NODE_TYPES.Identifier &&
  node.property.name === propertyName &&
  !node.computed;

export const isReactCallExpression = (
  node: DeepReadonly<TSESTree.CallExpression>,
  propertyName: string,
): boolean =>
  node.callee.type === AST_NODE_TYPES.MemberExpression &&
  isReactMemberExpression(node.callee, propertyName);

export const getReactMemoArrowFunction = (
  node: DeepReadonly<TSESTree.CallExpression>,
): DeepReadonly<TSESTree.ArrowFunctionExpression> | undefined => {
  const [firstArgument] = node.arguments;

  if (firstArgument === undefined) {
    return undefined;
  }

  if (firstArgument.type !== AST_NODE_TYPES.ArrowFunctionExpression) {
    return undefined;
  }

  return firstArgument;
};
