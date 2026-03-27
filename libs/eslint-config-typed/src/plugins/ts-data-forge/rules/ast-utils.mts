import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';

const isIntegerLiteral = (node: DeepReadonly<TSESTree.Expression>): boolean =>
  node.type === AST_NODE_TYPES.Literal &&
  typeof node.value === 'number' &&
  Number.isInteger(node.value);

export const isIntegerLiteralOrConstant = (
  node: DeepReadonly<TSESTree.Expression>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
): boolean => {
  // Direct integer literal (e.g., 3)
  if (isIntegerLiteral(node)) return true;

  // Identifier referencing a const variable initialized with an integer literal
  if (node.type !== AST_NODE_TYPES.Identifier) return false;

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const scope = sourceCode.getScope(node as TSESTree.Node);

  const variable = findVariable(scope, node.name);

  if (variable === undefined) return false;

  // Must have exactly one definition (const)
  if (variable.defs.length !== 1) return false;

  const def = variable.defs[0];

  if (def === undefined) return false;

  if (!isVariableDefinition(def)) return false;

  if (def.parent.kind !== 'const') return false;

  if (def.node.init == null) return false;

  // Reject if there is an explicit type annotation (e.g., `const n: number = 3`)
  // because the literal type is widened and type guard cannot narrow it.
  if (def.node.id.typeAnnotation !== undefined) return false;

  return isIntegerLiteral(def.node.init);
};

type VariableDefinition = Readonly<{
  type: string;
  parent: TSESTree.VariableDeclaration;
  node: TSESTree.VariableDeclarator;
}>;

const isVariableDefinition = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  def: TSESLint.Scope.Definition,
): def is TSESLint.Scope.Definition & VariableDefinition =>
  (def.type as string) === 'Variable';

const findVariable = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  scope: TSESLint.Scope.Scope,
  name: string,
): TSESLint.Scope.Variable | undefined => {
  const variable = scope.set.get(name);

  if (variable !== undefined) return variable;

  if (scope.upper === null) return undefined;

  return findVariable(scope.upper, name);
};
