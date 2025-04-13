import * as tsm from 'ts-morph';
import {
  isPrimitiveTypeNode,
  isReadonlyTupleOrArrayTypeNode,
} from '../../functions/index.mjs';

export const compareUnionIntersectionTypes = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  a: tsm.TypeNode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  b: tsm.TypeNode,
): number => mapRank(a) - mapRank(b);

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const mapRank = (t: tsm.TypeNode): number =>
  isPrimitiveTypeNode(t)
    ? 0
    : t.isKind(tsm.SyntaxKind.ArrayType) ||
        t.isKind(tsm.SyntaxKind.TupleType) ||
        isReadonlyTupleOrArrayTypeNode(t)
      ? 1
      : t.isKind(tsm.SyntaxKind.TypeLiteral)
        ? 2
        : 3;
