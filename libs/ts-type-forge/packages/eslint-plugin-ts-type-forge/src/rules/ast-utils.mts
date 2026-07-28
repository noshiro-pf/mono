import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * Matches the "non-empty array" tuple spelling — `readonly [V, ...V[]]` (and
 * its equivalent `readonly [V, ...(readonly V[])]`) — and returns the source
 * text of `V`, or `undefined` when `node` is not that shape.
 *
 * Deliberately narrow:
 *
 * - Only the `readonly` operator is matched. A mutable `[V, ...V[]]` is a
 *   different type (`MutableNonEmptyArray<V>`) and is left alone.
 * - Exactly two elements, the second being a rest element whose element type is
 *   textually identical to the first.
 * - Labelled members (`readonly [head: V, ...tail: V[]]`) are skipped, since
 *   rewriting them would silently drop the labels.
 */
export const getNonEmptyArrayElementText = (
  node: TSESTree.TSTypeOperator,
  sourceCode: TSESLint.SourceCode,
): string | undefined => {
  if (node.operator !== 'readonly') return undefined;

  const tuple = node.typeAnnotation;

  if (tuple?.type !== AST_NODE_TYPES.TSTupleType) return undefined;

  const [head, tail, ...rest] = tuple.elementTypes;

  if (head === undefined || tail === undefined || rest.length > 0) {
    return undefined;
  }

  if (
    head.type === AST_NODE_TYPES.TSRestType ||
    head.type === AST_NODE_TYPES.TSOptionalType ||
    head.type === AST_NODE_TYPES.TSNamedTupleMember ||
    tail.type !== AST_NODE_TYPES.TSRestType
  ) {
    return undefined;
  }

  const restElementType = getArrayElementType(tail.typeAnnotation);

  if (restElementType === undefined) return undefined;

  const headText = sourceCode.getText(head);

  return normalizeWhitespace(headText) ===
    normalizeWhitespace(sourceCode.getText(restElementType))
    ? headText
    : undefined;
};

/** Unwraps `V[]` and `readonly V[]` to `V`. */
const getArrayElementType = (
  node: TSESTree.TypeNode,
): TSESTree.TypeNode | undefined => {
  if (node.type === AST_NODE_TYPES.TSArrayType) return node.elementType;

  return node.type === AST_NODE_TYPES.TSTypeOperator &&
    node.operator === 'readonly' &&
    node.typeAnnotation?.type === AST_NODE_TYPES.TSArrayType
    ? node.typeAnnotation.elementType
    : undefined;
};

const normalizeWhitespace = (text: string): string =>
  text.replaceAll(/\s+/gu, ' ').trim();

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types */
