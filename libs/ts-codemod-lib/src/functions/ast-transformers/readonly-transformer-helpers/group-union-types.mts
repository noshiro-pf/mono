import * as tsm from 'ts-morph';
import {
  hasCallOrConstructSignature,
  isAtomicTypeNode,
  isReadonlyTupleOrArrayTypeNode,
  isReadonlyTypeReferenceNode,
  removeParentheses,
  type AtomicTypeNode,
  type ReadonlyArrayTypeNode,
  type ReadonlyTupleTypeNode,
  type ReadonlyTypeReferenceNode,
} from '../../functions/index.mjs';

export const groupUnionIntersectionTypes = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  types: readonly tsm.TypeNode[],
): Readonly<{
  primitives:
    | Readonly<{
        firstPosition: number;
        nodes: readonly AtomicTypeNode[];
      }>
    | undefined;

  arraysAndTuples:
    | Readonly<{
        firstPosition: number;
        nodes: readonly (
          | tsm.ArrayTypeNode
          | tsm.TupleTypeNode
          | ReadonlyArrayTypeNode
          | ReadonlyTupleTypeNode
        )[];
      }>
    | undefined;

  typeLiterals:
    | Readonly<{
        firstPosition: number;
        nodes: readonly (tsm.TypeLiteralNode | ReadonlyTypeReferenceNode)[];
      }>
    | undefined;

  others:
    | Readonly<{
        firstPosition: number;
        nodes: readonly tsm.TypeNode[];
      }>
    | undefined;
}> => {
  const mut_grouped: {
    primitives:
      | Readonly<{
          firstPosition: number;
          nodes: AtomicTypeNode[];
        }>
      | undefined;

    arraysAndTuples:
      | Readonly<{
          firstPosition: number;
          nodes: (
            | tsm.ArrayTypeNode
            | tsm.TupleTypeNode
            | ReadonlyArrayTypeNode
            | ReadonlyTupleTypeNode
          )[];
        }>
      | undefined;

    typeLiterals:
      | Readonly<{
          firstPosition: number;
          nodes: (tsm.TypeLiteralNode | ReadonlyTypeReferenceNode)[];
        }>
      | undefined;

    others:
      | Readonly<{
          firstPosition: number;
          nodes: tsm.TypeNode[];
        }>
      | undefined;
  } = {
    primitives: undefined,
    arraysAndTuples: undefined,
    typeLiterals: undefined,
    others: undefined,
  };

  for (const [i, t_] of types.entries()) {
    const t = removeParentheses(t_);

    // isReadonlyTypeReferenceNode
    if (isAtomicTypeNode(t)) {
      if (mut_grouped.primitives === undefined) {
        mut_grouped.primitives = {
          firstPosition: i,
          nodes: [t],
        } as const;
      } else {
        mut_grouped.primitives.nodes.push(t);
      }

      continue;
    }

    if (
      t.isKind(tsm.SyntaxKind.ArrayType) ||
      t.isKind(tsm.SyntaxKind.TupleType) ||
      isReadonlyTupleOrArrayTypeNode(t)
    ) {
      if (mut_grouped.arraysAndTuples === undefined) {
        mut_grouped.arraysAndTuples = {
          firstPosition: i,
          nodes: [t],
        } as const;
      } else {
        mut_grouped.arraysAndTuples.nodes.push(t);
      }

      continue;
    }

    // A type literal that declares a call or construct signature is deliberately
    // not grouped here: this group is joined and wrapped in a single
    // `Readonly<...>`, which such a literal does not survive. It falls through
    // to `others`, which leaves it as written. See
    // `hasCallOrConstructSignature`.
    if (
      (t.isKind(tsm.SyntaxKind.TypeLiteral) &&
        !hasCallOrConstructSignature(t)) ||
      isReadonlyTypeReferenceNode(t)
    ) {
      if (mut_grouped.typeLiterals === undefined) {
        mut_grouped.typeLiterals = {
          firstPosition: i,
          nodes: [t],
        } as const;
      } else {
        mut_grouped.typeLiterals.nodes.push(t);
      }

      continue;
    }

    // intersections, unions, etc.
    if (mut_grouped.others === undefined) {
      mut_grouped.others = {
        firstPosition: i,
        nodes: [t],
      } as const;
    } else {
      mut_grouped.others.nodes.push(t);
    }
  }

  return mut_grouped;
};
