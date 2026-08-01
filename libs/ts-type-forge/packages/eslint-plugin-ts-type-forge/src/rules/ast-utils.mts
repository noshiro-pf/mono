import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

export type UniformTupleShape = Readonly<{
  /** The node an autofix must replace: the tuple, or the `readonly` operator. */
  node: TSESTree.Node;
  isReadonly: boolean;
  /** Source text of the (single, shared) element type. */
  elementText: string;
  /** Number of leading fixed-position elements. */
  fixedCount: number;
  /** Whether a trailing `...V[]` rest element is present. */
  hasRest: boolean;
}>;

/**
 * Recognizes a tuple whose every position has the *same* element type — the
 * hand-rolled spelling of ts-type-forge's length-constrained tuple family:
 *
 * | shape                | meaning                    |
 * | :------------------- | :------------------------- |
 * | `[V, ..., V]`        | `FixedLengthTuple<N, V>`   |
 * | `[V, ..., V, ...V[]]`| `MinLengthTuple<N, V>`     |
 *
 * Returns `undefined` for anything else. Deliberately narrow:
 *
 * - Element types are compared by normalized source text, so heterogeneous
 *   tuples are never matched.
 * - Optional (`[V?]`) and labelled (`[head: V]`) members are skipped, since
 *   rewriting them would drop information.
 * - A tuple that is only a rest element (`[...V[]]`) is not a length
 *   constraint at all.
 */
export const analyzeUniformTuple = (
  tuple: TSESTree.TSTupleType,
  sourceCode: TSESLint.SourceCode,
): UniformTupleShape | undefined => {
  const { parent } = tuple;

  const isReadonly =
    parent.type === AST_NODE_TYPES.TSTypeOperator &&
    parent.operator === 'readonly';

  const elements = tuple.elementTypes;

  const last = elements.at(-1);

  const hasRest = last?.type === AST_NODE_TYPES.TSRestType;

  const leading = hasRest ? elements.slice(0, -1) : elements;

  if (
    leading.length === 0 ||
    leading.some(
      (element) =>
        element.type === AST_NODE_TYPES.TSRestType ||
        element.type === AST_NODE_TYPES.TSOptionalType ||
        element.type === AST_NODE_TYPES.TSNamedTupleMember,
    )
  ) {
    return undefined;
  }

  const restElementType =
    last !== undefined && hasRest
      ? getArrayElementType(last.typeAnnotation)
      : undefined;

  if (hasRest && restElementType === undefined) return undefined;

  const [head] = leading;

  if (head === undefined) return undefined;

  const elementText = sourceCode.getText(head);

  const expected = normalizeWhitespace(elementText);

  const others = [
    ...leading.slice(1),
    ...(restElementType === undefined ? [] : [restElementType]),
  ];

  return others.every(
    (element) => normalizeWhitespace(sourceCode.getText(element)) === expected,
  )
    ? {
        node: isReadonly ? parent : tuple,
        isReadonly,
        elementText,
        fixedCount: leading.length,
        hasRest,
      }
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
