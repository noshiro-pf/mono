import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';

/**
 * `node` with every `as`, `satisfies`, `!` and `<T>` around it taken off: the
 * expression whose value it is. A wrapper changes no value, so a rule judges
 * syntax on this — `xs.length > (0 as number)` compares with the literal `0`
 * — and writes its fix from the original node so the wrapper is kept. A type
 * is another matter: see {@link typeWrapperLayers}. See
 * `docs/writing-lint-rules.md` at the repository root. A copy of
 * `eslint-config-typed`'s `type-wrapper-utils.mts`, since this package is
 * published on its own.
 */
export const skipTypeWrappers = <N extends TSESTree.Node>(
  node: N,
): N | TSESTree.Expression =>
  isTypeWrapper(node) ? skipTypeWrappers(node.expression) : node;

/**
 * `node` and every expression inside the type wrappers around it, outermost
 * first: `x as A as B` gives `x as A as B`, `x as A` and `x`.
 *
 * A conclusion a rule draws from a type — that a guard always holds, that a
 * value is an array, that `?? 0` is dead — has to hold for the type of every
 * layer. An assertion therefore only ever makes a rule more cautious: one
 * that widens (`x as string | null`) is the author saying the value may be
 * `null`, and is respected; one that narrows (`x!`, `v as string` on an
 * `unknown`) is a claim the checker cannot verify, and the value's own type
 * still decides.
 */
export const typeWrapperLayers = <N extends TSESTree.Node>(
  node: N,
): readonly (N | TSESTree.Expression)[] =>
  isTypeWrapper(node)
    ? ([node, ...typeWrapperLayers(node.expression)] as const)
    : ([node] as const);

export const isTypeWrapper = (
  node: DeepReadonly<TSESTree.Node>,
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

const isIntegerLiteral = (node: DeepReadonly<TSESTree.Expression>): boolean =>
  node.type === AST_NODE_TYPES.Literal &&
  typeof node.value === 'number' &&
  Number.isInteger(node.value);

/**
 * The source text of `node` for an argument position. A node's text never
 * includes the parentheses the source wrote around it, so a comma (sequence)
 * expression gets them back rather than spilling into the next argument.
 */
export const toArgumentText = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
): string => {
  const text = sourceCode.getText(node);

  return node.type === AST_NODE_TYPES.SequenceExpression ? `(${text})` : text;
};

/**
 * Whether `node` is an array or a tuple at every layer of type wrappers (see
 * {@link typeWrapperLayers}): a cast does not make a string an array, and the
 * fix, which keeps the wrapper, has to type-check too. `false` without type
 * information.
 */
export const isArrayOrTupleExpression = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  services: TSESLint.SourceCode['parserServices'],
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Expression,
): boolean => {
  const checker = services?.program?.getTypeChecker();

  if (checker === undefined) {
    return false;
  }

  return typeWrapperLayers(node).every((expression) => {
    const tsNode = services?.esTreeNodeToTSNodeMap?.get(expression);

    if (tsNode === undefined) {
      return false;
    }

    const type = checker.getTypeAtLocation(tsNode);

    return checker.isArrayType(type) || checker.isTupleType(type);
  });
};

/**
 * Whether `node`, under any type wrapper, is an integer literal or a `const`
 * initialized with one.
 */
export const isIntegerLiteralOrConstant = (
  node: DeepReadonly<TSESTree.Expression>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
): boolean => {
  // `(3 as number)`, `3 satisfies number` are still the bound 3.
  if (isTypeWrapper(node)) {
    return isIntegerLiteralOrConstant(node.expression, sourceCode);
  }

  // Direct integer literal (e.g., 3)
  if (isIntegerLiteral(node)) {
    return true;
  }

  // Identifier referencing a const variable initialized with an integer literal
  if (node.type !== AST_NODE_TYPES.Identifier) {
    return false;
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const scope = sourceCode.getScope(node as TSESTree.Node);

  const variable = findVariable(scope, node.name);

  if (variable === undefined) {
    return false;
  }

  // Must have exactly one definition (const)
  if (variable.defs.length !== 1) {
    return false;
  }

  const def = variable.defs[0];

  return (
    def !== undefined &&
    isVariableDefinition(def) &&
    def.parent.kind === 'const' &&
    def.node.init != null &&
    // Reject if there is an explicit type annotation (e.g., `const n: number = 3`)
    // because the literal type is widened and type guard cannot narrow it.
    def.node.id.typeAnnotation === undefined &&
    isIntegerLiteral(def.node.init)
  );
};

/**
 * `node` as a `<array>.length` read, looked for under any type wrapper
 * (`(xs.length satisfies number)`, `xs.length!`), or `undefined`. The property
 * must be written `.length`: `xs[length]` reads whatever index the variable
 * `length` holds.
 */
export const asLengthAccess = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Expression,
): TSESTree.MemberExpression | undefined => {
  const inner = skipTypeWrappers(node);

  return inner.type === AST_NODE_TYPES.MemberExpression &&
    !inner.computed &&
    inner.property.type === AST_NODE_TYPES.Identifier &&
    inner.property.name === 'length'
    ? inner
    : undefined;
};

/**
 * Whether two array expressions are written the same way, type wrappers aside:
 * `xs.length >= 1 && (xs as readonly T[]).length <= 3` bounds one array.
 */
export const isSameArrayText = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  a: TSESTree.Expression,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  b: TSESTree.Expression,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
): boolean =>
  sourceCode.getText(skipTypeWrappers(a)) ===
  sourceCode.getText(skipTypeWrappers(b));

type LengthComparison = Readonly<{
  array: TSESTree.Expression;
  bound: TSESTree.Expression;
  kind: 'max' | 'min';
}>;

/**
 * Parses a `<array>.length <op> <bound>` comparison (in either operand order)
 * into its array expression, integer-literal/`const` `bound`, and whether it is
 * a lower (`min`) or upper (`max`) length bound. Returns `undefined` for
 * anything else. The length and the bound are read through type wrappers; the
 * `bound` returned is the literal or constant underneath, since a wrapper such
 * as `as number` would only widen the length a guard narrows to.
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

  const leftLength = asLengthAccess(left);

  const lengthOnLeft = leftLength !== undefined;

  const lengthSide = leftLength ?? asLengthAccess(right);

  const boundSide = lengthOnLeft ? right : left;

  if (lengthSide === undefined) {
    return undefined;
  }

  if (!isIntegerLiteralOrConstant(boundSide, sourceCode)) {
    return undefined;
  }

  const kind: LengthComparison['kind'] = (
    lengthOnLeft ? operator === '>=' : operator === '<='
  )
    ? 'min'
    : 'max';

  return {
    array: lengthSide.object,
    bound: skipTypeWrappers(boundSide),
    kind,
  };
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

  if (self === undefined) {
    return false;
  }

  const sibling = parent.left === node ? parent.right : parent.left;

  const other = parseLengthComparison(sibling, sourceCode);

  if (other === undefined) {
    return false;
  }

  return (
    self.kind !== other.kind &&
    isSameArrayText(self.array, other.array, sourceCode)
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

  return (
    variable ??
    (scope.upper === null ? undefined : findVariable(scope.upper, name))
  );
};
