import {
  AST_NODE_TYPES,
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import type * as ts from 'typescript';

/**
 * `node` with every `as`, `satisfies`, `!` and `<T>` around it taken off: the
 * expression whose value it is. Judge syntax and ask types on what this
 * returns, so that a wrapper neither hides a pattern (`xs.length > (0 as
 * const)`) nor vouches for a type (`Number(b as unknown as string)`, whose
 * value is still a boolean), and keep the original node for fix text. See
 * `docs/writing-lint-rules.md` at the repository root.
 *
 * A copy of the helper in `eslint-config-typed`, which this package, published
 * on its own, cannot import.
 */
export const skipTypeWrappers = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): TSESTree.Node =>
  isTypeWrapper(node) ? skipTypeWrappers(node.expression) : node;

export const isTypeWrapper = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): node is TypeWrapper => TYPE_WRAPPERS.has(node.type);

/**
 * Whether `node`, read through its type wrappers, is the identifier `name`:
 * `Number`, `(Number as NumberConstructor)` and `Number!` are the same object.
 */
export const isIdentifierNamed = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  name: string,
): boolean => {
  const unwrapped = skipTypeWrappers(node);

  return (
    unwrapped.type === AST_NODE_TYPES.Identifier && unwrapped.name === name
  );
};

export type TypeWrapper =
  | TSESTree.TSAsExpression
  | TSESTree.TSNonNullExpression
  | TSESTree.TSSatisfiesExpression
  | TSESTree.TSTypeAssertion;

/**
 * The type of the value `node` evaluates to, asked of the expression inside
 * its type wrappers rather than of the cast, or `undefined` without type
 * information. A `!` among the wrappers still takes `null` and `undefined`
 * out, since that much the source asserts about the value itself.
 */
export const getValueType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): ts.Type | undefined => {
  const services = sourceCode.parserServices;

  const checker = services?.program?.getTypeChecker();

  const tsNode = services?.esTreeNodeToTSNodeMap?.get(skipTypeWrappers(node));

  if (checker === undefined || tsNode === undefined) {
    return undefined;
  }

  const type = checker.getTypeAtLocation(tsNode);

  return hasNonNullAssertion(node) ? checker.getNonNullableType(type) : type;
};

/**
 * The source text of `node` to put in a call's argument list. `getText`
 * leaves out the parentheses the source puts around a node, and a sequence
 * `(a, b)` without them would be read as two arguments.
 */
export const getArgumentText = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): string => {
  const text = sourceCode.getText(node);

  return node.type === AST_NODE_TYPES.SequenceExpression ? `(${text})` : text;
};

/**
 * The range of `node` together with the parentheses the source puts around it,
 * which `node.range` leaves out: all of `((Array.isArray))` for the member
 * expression inside.
 */
export const getRangeWithParens = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): TSESTree.Range => {
  const depth = parenthesesDepth(sourceCode, node);

  if (depth === 0) {
    return node.range;
  }

  const opening = sourceCode.getTokenBefore(node, { skip: depth - 1 });

  const closing = sourceCode.getTokenAfter(node, { skip: depth - 1 });

  return opening === null || closing === null
    ? node.range
    : [opening.range[0], closing.range[1]];
};

/** How many pairs of parentheses the source puts around `node`. */
const parenthesesDepth = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  depth: number = 0,
): number =>
  ASTUtils.isParenthesized(depth + 1, node, sourceCode)
    ? parenthesesDepth(sourceCode, node, depth + 1)
    : depth;

const hasNonNullAssertion = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean =>
  isTypeWrapper(node) &&
  (node.type === AST_NODE_TYPES.TSNonNullExpression ||
    hasNonNullAssertion(node.expression));

const TYPE_WRAPPERS: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.TSAsExpression,
  AST_NODE_TYPES.TSNonNullExpression,
  AST_NODE_TYPES.TSSatisfiesExpression,
  AST_NODE_TYPES.TSTypeAssertion,
]);
