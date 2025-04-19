import * as ts from 'typescript';
import {
  isPrimitiveTypeNode,
  isReadonlyTupleOrArrayTypeNode,
  type PrimitiveTypeNode,
  type ReadonlyArrayTypeNode,
  type ReadonlyTupleTypeNode,
} from '../../functions/index.mjs';

export const groupUnionIntersectionTypes = (
  types: DeepReadonly<ts.TypeNode[]>,
): Readonly<{
  primitives:
    | Readonly<{
        firstPosition: number;
        nodes: readonly PrimitiveTypeNode[];
      }>
    | undefined;

  arraysAndTuples:
    | Readonly<{
        firstPosition: number;
        nodes: readonly (
          | ts.ArrayTypeNode
          | ts.TupleTypeNode
          | ReadonlyArrayTypeNode
          | ReadonlyTupleTypeNode
        )[];
      }>
    | undefined;

  typeLiterals:
    | Readonly<{
        firstPosition: number;
        nodes: readonly ts.TypeLiteralNode[];
      }>
    | undefined;

  others:
    | Readonly<{
        firstPosition: number;
        nodes: readonly ts.TypeNode[];
      }>
    | undefined;
}> => {
  const mut_grouped: {
    primitives:
      | {
          firstPosition: number;
          nodes: PrimitiveTypeNode[];
        }
      | undefined;

    arraysAndTuples:
      | {
          firstPosition: number;
          nodes: (
            | ts.ArrayTypeNode
            | ts.TupleTypeNode
            | ReadonlyArrayTypeNode
            | ReadonlyTupleTypeNode
          )[];
        }
      | undefined;

    typeLiterals:
      | {
          firstPosition: number;
          nodes: ts.TypeLiteralNode[];
        }
      | undefined;

    others:
      | {
          firstPosition: number;
          nodes: ts.TypeNode[];
        }
      | undefined;
  } = {
    primitives: undefined,
    arraysAndTuples: undefined,
    typeLiterals: undefined,
    others: undefined,
  };

  for (const [i, t] of types.entries()) {
    if (isPrimitiveTypeNode(t)) {
      if (mut_grouped.primitives === undefined) {
        mut_grouped.primitives = {
          firstPosition: i,
          nodes: [t],
        };
      } else {
        mut_grouped.primitives.nodes.push(t);
      }
      continue;
    }

    if (
      ts.isArrayTypeNode(t) ||
      ts.isTupleTypeNode(t) ||
      isReadonlyTupleOrArrayTypeNode(t)
    ) {
      if (mut_grouped.arraysAndTuples === undefined) {
        mut_grouped.arraysAndTuples = {
          firstPosition: i,
          nodes: [t],
        };
      } else {
        mut_grouped.arraysAndTuples.nodes.push(t);
      }
      continue;
    }

    if (ts.isTypeLiteralNode(t)) {
      if (mut_grouped.typeLiterals === undefined) {
        mut_grouped.typeLiterals = {
          firstPosition: i,
          nodes: [t],
        };
      } else {
        mut_grouped.typeLiterals.nodes.push(t);
      }

      continue;
    }

    if (mut_grouped.others === undefined) {
      mut_grouped.others = {
        firstPosition: i,
        nodes: [t],
      };
    } else {
      mut_grouped.others.nodes.push(t);
    }
  }

  return mut_grouped;
};
