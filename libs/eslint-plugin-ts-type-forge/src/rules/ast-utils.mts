import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';

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
 * - A tuple inside the `extends` clause of a conditional type is a match
 *   pattern, not a type (see {@link isInConditionalTypeExtendsClause}).
 */
export const analyzeUniformTuple = (
  tuple: TSESTree.TSTupleType,
  sourceCode: TSESLint.SourceCode,
): UniformTupleShape | undefined => {
  if (isInConditionalTypeExtendsClause(tuple)) return undefined;

  const { parent } = tuple;

  const isReadonly =
    parent.type === AST_NODE_TYPES.TSTypeOperator &&
    parent.operator === 'readonly';

  const elements = tuple.elementTypes;

  const last = elements.at(-1);

  const hasRest = last?.type === AST_NODE_TYPES.TSRestType;

  const leading = hasRest ? Arr.butLast(elements) : elements;

  if (
    Arr.isEmpty(leading) ||
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
    ...Arr.tail(leading),
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

/**
 * Whether `node` sits inside the `extends` clause of a conditional type, where
 * a tuple is a *match pattern* rather than a type.
 *
 * `[A, B] extends [true, true]` matches element-wise even while `A` and `B` are
 * still generic. The canonical spellings resolve through a mapped type
 * (`MutableFixedLengthTuple<N, V>` is `Mutable<FixedLengthTuple<N, V>>`), and
 * against one of those the checker defers the whole conditional instead —
 * yielding `boolean` where the tuple pattern yielded `true` or `false`, which
 * silently widens everything downstream. So those positions are left alone.
 */
const isInConditionalTypeExtendsClause = (node: TSESTree.Node): boolean => {
  // The root has no parent, so it terminates the walk.
  if (node.type === AST_NODE_TYPES.Program) return false;

  const { parent } = node;

  return (
    (parent.type === AST_NODE_TYPES.TSConditionalType &&
      parent.extendsType === node) ||
    isInConditionalTypeExtendsClause(parent)
  );
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
