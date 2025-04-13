import { Arr, expectType } from '@noshiro/ts-utils';
import * as ts from 'typescript';
import { isPrimitiveTypeNode } from './is-primitive-type-node.mjs';

export const isShallowReadonlyTypeNode = (node: ts.Node): boolean =>
  isReadonlyTupleOrArrayTypeNode(node) ||
  isReadonlyTypeNode(node) ||
  isPrimitiveTypeNode(node);

export const isReadonlyTupleOrArrayTypeNode = (
  node: ts.Node,
): node is ReadonlyArrayTypeNode | ReadonlyTupleTypeNode =>
  ts.isTypeOperatorNode(node) &&
  node.operator === ts.SyntaxKind.ReadonlyKeyword &&
  (ts.isArrayTypeNode(node.type) || ts.isTupleTypeNode(node.type));

export type ReadonlyArrayTypeNode = ts.TypeOperatorNode &
  Readonly<{
    operator: ts.SyntaxKind.ReadonlyKeyword;
    type: ts.ArrayTypeNode;
  }>;

export const isReadonlyArrayTypeNode = (
  node: ts.Node,
): node is ReadonlyArrayTypeNode =>
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

    if (isReadonlyArrayTypeNode(node)) {
      expectType<typeof node.operator, ts.SyntaxKind.ReadonlyKeyword>('=');
      expectType<typeof node.type, ts.TypeNode & ts.ArrayTypeNode>('=');
    }

    expect(node.kind).toBe(ts.SyntaxKind.TypeOperator);
  });
}

export type ReadonlyTupleTypeNode = ts.TypeOperatorNode &
  Readonly<{
    operator: ts.SyntaxKind.ReadonlyKeyword;
    type: ts.TupleTypeNode;
  }>;

export const isReadonlyTupleTypeNode = (
  node: ts.Node,
): node is ReadonlyTupleTypeNode =>
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

    if (isReadonlyTupleTypeNode(node)) {
      expectType<typeof node.operator, ts.SyntaxKind.ReadonlyKeyword>('=');
      expectType<typeof node.type, ts.TypeNode & ts.TupleTypeNode>('=');
    }

    expect(node.kind).toBe(ts.SyntaxKind.TypeOperator);
  });
}

export type ReadonlyTypeNode = ts.TypeReferenceNode &
  Readonly<{
    typeName: Readonly<{
      kind: ts.SyntaxKind.Identifier;
      text: 'Readonly';
    }>;
    typeArguments: ts.NodeArray<ts.TypeNode> & readonly [ts.TypeNode];
  }>;

export const isReadonlyTypeNode = (node: ts.Node): node is ReadonlyTypeNode =>
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

    if (isReadonlyTypeNode(node)) {
      expectType<typeof node.kind, ts.SyntaxKind.TypeReference>('=');
      expectType<typeof node.typeName.kind, ts.SyntaxKind.Identifier>('=');
      expectType<typeof node.typeName.text, 'Readonly'>('=');
      expectType<(typeof node.typeArguments)[0], ts.TypeNode>('=');
    }

    expect(node.kind).toBe(ts.SyntaxKind.TypeReference);

    if (!isReadonlyTypeNode(node)) {
      throw new Error('node should be ReadonlyNode');
    }

    expect(node.typeName.kind).toBe(ts.SyntaxKind.Identifier);
    expect(node.typeName.text).toBe('Readonly');
    expect(node.typeArguments).toHaveLength(1);
  });
}
