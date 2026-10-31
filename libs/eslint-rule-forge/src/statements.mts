import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import type { DeepReadonly } from 'ts-type-forge';

/**
 * The statement next to `node` (`offset` 1) or before it (-1) in the statement
 * list `node` is one of: the program's, a block's, a class static block's, a
 * namespace's or a `case`'s. What an `export` declares (or, for
 * `export default`, the expression it exports) is read as the `export`
 * statement. `undefined` when there is none, or when `node` is not in a
 * statement list (an arrow function's expression body, a `for` initializer).
 */
export const siblingOf = (
  node: DeepReadonly<TSESTree.Node>,
  offset: 1 | -1,
): DeepReadonly<TSESTree.Node> | undefined => {
  const { parent } = node;

  const statement =
    (parent?.type === AST_NODE_TYPES.ExportNamedDeclaration ||
      parent?.type === AST_NODE_TYPES.ExportDefaultDeclaration) &&
    parent.declaration === node
      ? parent
      : node;

  const list = statementListOf(statement);

  if (list === undefined) {
    return undefined;
  }

  const index = list.indexOf(statement);

  return index === -1 ? undefined : list[index + offset];
};

const statementListOf = (
  node: DeepReadonly<TSESTree.Node>,
): readonly DeepReadonly<TSESTree.Node>[] | undefined => {
  const { parent } = node;

  if (parent === undefined) {
    return undefined;
  }

  if (
    parent.type === AST_NODE_TYPES.Program ||
    parent.type === AST_NODE_TYPES.BlockStatement ||
    parent.type === AST_NODE_TYPES.StaticBlock ||
    parent.type === AST_NODE_TYPES.TSModuleBlock
  ) {
    return parent.body;
  }

  return parent.type === AST_NODE_TYPES.SwitchCase
    ? parent.consequent
    : undefined;
};
