import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { isTypeWrapper, skipTypeWrappers } from 'eslint-rule-forge';
import type * as ts from 'typescript';

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

const hasNonNullAssertion = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean =>
  isTypeWrapper(node) &&
  (node.type === AST_NODE_TYPES.TSNonNullExpression ||
    hasNonNullAssertion(node.expression));
