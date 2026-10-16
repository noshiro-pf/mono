import {
  AST_NODE_TYPES,
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import type { DeepReadonly } from 'ts-type-forge';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * How many pairs of parentheses the source puts around `node`: `0` for `a`, `2`
 * for `((a))`. The parentheses of a call's argument list are not counted.
 */
export const parenthesesDepth = (
  sourceCode: TSESLint.SourceCode,
  node: DeepReadonly<TSESTree.Node>,
): number => {
  const mutableNode = asNode(node);

  const depthFrom = (known: number): number =>
    ASTUtils.isParenthesized(known + 1, mutableNode, sourceCode)
      ? depthFrom(known + 1)
      : known;

  return depthFrom(0);
};

/**
 * The range of `node` together with the parentheses the source puts around it,
 * which `node.range` leaves out: all of `((Array.isArray))` for the member
 * expression inside.
 */
export const getRangeWithParens = (
  sourceCode: TSESLint.SourceCode,
  node: DeepReadonly<TSESTree.Node>,
): TSESTree.Range => {
  const depth = parenthesesDepth(sourceCode, node);

  if (depth === 0) {
    return [node.range[0], node.range[1]];
  }

  const opening = sourceCode.getTokenBefore(asNode(node), { skip: depth - 1 });

  const closing = sourceCode.getTokenAfter(asNode(node), { skip: depth - 1 });

  return opening === null || closing === null
    ? [node.range[0], node.range[1]]
    : [opening.range[0], closing.range[1]];
};

/**
 * The source text of `node` to put in a call's argument list. A node's text
 * never includes the parentheses the source wrote around it, so a sequence
 * expression gets them back here, whether or not the source had them:
 * `(setup(), x)` would otherwise become two arguments.
 */
export const getArgumentText = (
  sourceCode: TSESLint.SourceCode,
  node: DeepReadonly<TSESTree.Node>,
): string => {
  const text = sourceCode.text.slice(node.range[0], node.range[1]);

  return node.type === AST_NODE_TYPES.SequenceExpression ? `(${text})` : text;
};

/**
 * The parser's node, which the token store takes as mutable, for one that this
 * package only reads.
 */
const asNode = (node: DeepReadonly<TSESTree.Node>): TSESTree.Node =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as TSESTree.Node;
