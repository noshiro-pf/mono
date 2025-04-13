import * as ts from 'typescript';
import {
  isPrimitiveTypeNode,
  isReadonlyTupleOrArrayTypeNode,
} from '../../functions/index.mjs';

export const compareUnionIntersectionTypes = (
  a: Readonly<ts.TypeNode>,
  b: Readonly<ts.TypeNode>,
): number => mapRank(a) - mapRank(b);

const mapRank = (t: Readonly<ts.TypeNode>): number =>
  isPrimitiveTypeNode(t)
    ? 0
    : ts.isArrayTypeNode(t) ||
        ts.isTupleTypeNode(t) ||
        isReadonlyTupleOrArrayTypeNode(t)
      ? 1
      : ts.isTypeLiteralNode(t)
        ? 2
        : 3;
