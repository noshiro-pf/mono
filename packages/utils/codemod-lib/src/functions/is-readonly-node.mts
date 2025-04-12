import { Arr, expectType } from '@noshiro/ts-utils';
import * as ts from 'typescript';

export const isReadonlyTupleOrArrayNode = (
  node: ts.Node,
): node is ts.TypeOperatorNode &
  Readonly<{ type: ts.ArrayTypeNode | ts.TupleTypeNode }> =>
  ts.isTypeOperatorNode(node) &&
  node.operator === ts.SyntaxKind.ReadonlyKeyword &&
  (ts.isArrayTypeNode(node.type) || ts.isTupleTypeNode(node.type));

export const isReadonlyArrayNode = (
  node: ts.Node,
): node is ts.TypeOperatorNode & Readonly<{ type: ts.ArrayTypeNode }> =>
  ts.isTypeOperatorNode(node) &&
  node.operator === ts.SyntaxKind.ReadonlyKeyword &&
  ts.isArrayTypeNode(node.type);

if (import.meta.vitest !== undefined) {
  test('isReadonlyArrayNode', () => {
    // readonly number[]
    const node = ts.factory.createTypeOperatorNode(
      ts.SyntaxKind.ReadonlyKeyword,
      ts.factory.createArrayTypeNode(
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
      ),
    ) as ts.Node;

    if (isReadonlyArrayNode(node)) {
      expectType<
        typeof node.operator,
        | ts.SyntaxKind.KeyOfKeyword
        | ts.SyntaxKind.ReadonlyKeyword
        | ts.SyntaxKind.UniqueKeyword
      >('=');
      expectType<typeof node.type, ts.TypeNode & ts.ArrayTypeNode>('=');
    }

    expect(node.kind).toBe(ts.SyntaxKind.TypeOperator);
  });
}

export const isReadonlyTupleNode = (
  node: ts.Node,
): node is ts.TypeOperatorNode & Readonly<{ type: ts.TupleTypeNode }> =>
  ts.isTypeOperatorNode(node) &&
  node.operator === ts.SyntaxKind.ReadonlyKeyword &&
  ts.isTupleTypeNode(node.type);

if (import.meta.vitest !== undefined) {
  test('isReadonlyTupleNode', () => {
    // readonly [number, number, number]
    const node = ts.factory.createTypeOperatorNode(
      ts.SyntaxKind.ReadonlyKeyword,
      ts.factory.createTupleTypeNode([
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
      ]),
    ) as ts.Node;

    if (isReadonlyTupleNode(node)) {
      expectType<
        typeof node.operator,
        | ts.SyntaxKind.KeyOfKeyword
        | ts.SyntaxKind.ReadonlyKeyword
        | ts.SyntaxKind.UniqueKeyword
      >('=');
      expectType<typeof node.type, ts.TypeNode & ts.TupleTypeNode>('=');
    }

    expect(node.kind).toBe(ts.SyntaxKind.TypeOperator);
  });
}

export const isReadonlyNode = (
  node: ts.Node,
): node is ts.TypeReferenceNode &
  Readonly<{
    typeName: Readonly<{
      kind: ts.SyntaxKind.Identifier;
      text: 'Readonly';
    }>;
    typeArguments: ts.NodeArray<ts.TypeNode> & readonly [ts.TypeNode];
  }> =>
  ts.isTypeReferenceNode(node) &&
  node.typeName.kind === ts.SyntaxKind.Identifier &&
  node.typeName.text === 'Readonly' &&
  node.typeArguments !== undefined &&
  Arr.isArrayOfLength1(node.typeArguments);

if (import.meta.vitest !== undefined) {
  test('isReadonlyNode', () => {
    // Readonly<{ x: number }>
    const node = ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier('Readonly'),
      [
        ts.factory.createTypeLiteralNode([
          ts.factory.createPropertySignature(
            undefined,
            ts.factory.createIdentifier('x'),
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
          ),
        ]),
      ],
    ) as ts.Node;

    if (isReadonlyNode(node)) {
      expectType<typeof node.kind, ts.SyntaxKind.TypeReference>('=');
      expectType<typeof node.typeName.kind, ts.SyntaxKind.Identifier>('=');
      expectType<typeof node.typeName.text, 'Readonly'>('=');
      expectType<(typeof node.typeArguments)[0], ts.TypeNode>('=');
    }

    expect(node.kind).toBe(ts.SyntaxKind.TypeReference);

    if (!isReadonlyNode(node)) {
      throw new Error('node should be ReadonlyNode');
    }

    expect(node.typeName.kind).toBe(ts.SyntaxKind.Identifier);
    expect(node.typeName.text).toBe('Readonly');
    expect(node.typeArguments).toHaveLength(1);
  });
}
