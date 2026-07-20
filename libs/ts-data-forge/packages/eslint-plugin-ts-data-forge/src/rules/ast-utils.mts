import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';

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

export const isLengthAccess = (
  node: DeepReadonly<TSESTree.Expression>,
): node is TSESTree.MemberExpression =>
  node.type === AST_NODE_TYPES.MemberExpression &&
  node.property.type === AST_NODE_TYPES.Identifier &&
  node.property.name === 'length';

type LengthComparison = Readonly<{
  array: TSESTree.Expression;
  bound: TSESTree.Expression;
  kind: 'max' | 'min';
}>;

/**
 * Parses a `<array>.length <op> <bound>` comparison (in either operand order)
 * into its array expression, integer-literal/`const` `bound`, and whether it is
 * a lower (`min`) or upper (`max`) length bound. Returns `undefined` for
 * anything else.
 *
 * - `xs.length >= n` / `n <= xs.length` → `min`
 * - `xs.length <= n` / `n >= xs.length` → `max`
 */
export const parseLengthComparison = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Expression,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
): LengthComparison | undefined => {
  if (
    node.type !== AST_NODE_TYPES.BinaryExpression ||
    (node.operator !== '>=' && node.operator !== '<=')
  ) {
    return undefined;
  }

  const { left, right, operator } = node;

  const lengthOnLeft = isLengthAccess(left);

  const lengthSide = lengthOnLeft ? left : right;

  const boundSide = lengthOnLeft ? right : left;

  if (!isLengthAccess(lengthSide)) return undefined;

  if (!isIntegerLiteralOrConstant(boundSide, sourceCode)) return undefined;

  const kind: LengthComparison['kind'] = (
    lengthOnLeft ? operator === '>=' : operator === '<='
  )
    ? 'min'
    : 'max';

  return { array: lengthSide.object, bound: boundSide, kind };
};

/**
 * `true` when `node` is one operand of an `a && b` whose other operand is the
 * complementary length bound (`min` vs `max`) on the same array — i.e. the two
 * together form the `Arr.isBoundedLengthArray` pattern handled by
 * `prefer-arr-is-bounded-length-array`. The single-bound rules skip such
 * operands so the bounded rule rewrites the whole `&&` instead of the parts.
 */
export const isPartOfBoundedLengthCheck = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.BinaryExpression,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
): boolean => {
  const { parent } = node;

  if (
    parent.type !== AST_NODE_TYPES.LogicalExpression ||
    parent.operator !== '&&'
  ) {
    return false;
  }

  const self = parseLengthComparison(node, sourceCode);

  if (self === undefined) return false;

  const sibling = parent.left === node ? parent.right : parent.left;

  const other = parseLengthComparison(sibling, sourceCode);

  if (other === undefined) return false;

  return (
    self.kind !== other.kind &&
    sourceCode.getText(self.array) === sourceCode.getText(other.array)
  );
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
