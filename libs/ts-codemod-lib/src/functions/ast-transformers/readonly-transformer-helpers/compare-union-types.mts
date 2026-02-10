import * as tsm from 'ts-morph';
import {
  isAtomicTypeNode,
  isReadonlyTupleOrArrayTypeNode,
} from '../../functions/index.mjs';

export const compareUnionIntersectionTypes = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  a: tsm.TypeNode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  b: tsm.TypeNode,
): number => mapRank(a) - mapRank(b);

const mapRank = (t: DeepReadonly<tsm.TypeNode>): 0 | 1 | 2 | 3 =>
  isAtomicTypeNode(t)
    ? (0 as const)
    : t.isKind(tsm.SyntaxKind.ArrayType) ||
        t.isKind(tsm.SyntaxKind.TupleType) ||
        isReadonlyTupleOrArrayTypeNode(t)
      ? (1 as const)
      : t.isKind(tsm.SyntaxKind.TypeLiteral)
        ? (2 as const)
        : (3 as const);
