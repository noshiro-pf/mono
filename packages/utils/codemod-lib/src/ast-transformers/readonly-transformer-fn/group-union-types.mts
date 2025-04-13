import { Arr } from '@noshiro/ts-utils';
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
  primitives: readonly PrimitiveTypeNode[];
  arraysAndTuples: readonly (
    | ts.ArrayTypeNode
    | ts.TupleTypeNode
    | ReadonlyArrayTypeNode
    | ReadonlyTupleTypeNode
  )[];
  typeLiterals: readonly ts.TypeLiteralNode[];
  others: readonly ts.TypeNode[];
}> => {
  // assume types are normalized
  const grouped = Arr.groupBy(types, (t) =>
    isPrimitiveTypeNode(t)
      ? 'primitives'
      : ts.isArrayTypeNode(t) ||
          ts.isTupleTypeNode(t) ||
          isReadonlyTupleOrArrayTypeNode(t)
        ? 'arraysAndTuples'
        : ts.isTypeLiteralNode(t)
          ? 'typeLiterals'
          : 'others',
  );

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const primitives = (grouped.get('primitives') ?? []) as PrimitiveTypeNode[];

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const arraysAndTuples = (grouped.get('arraysAndTuples') ?? []) as (
    | ts.ArrayTypeNode
    | ts.TupleTypeNode
    | ReadonlyArrayTypeNode
    | ReadonlyTupleTypeNode
  )[];

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const typeLiterals = (grouped.get('typeLiterals') ??
    []) as readonly ts.TypeLiteralNode[];

  const others = grouped.get('others') ?? [];

  return {
    primitives,
    arraysAndTuples,
    typeLiterals,
    others,
  };
};
