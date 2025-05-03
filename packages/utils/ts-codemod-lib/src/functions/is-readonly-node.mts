import { Arr, expectType } from '@noshiro/ts-utils';
import * as tsm from 'ts-morph';
import { isPrimitiveTypeNode } from './is-primitive-type-node.mjs';

export const isShallowReadonlyTypeNode = (node: tsm.Node): boolean =>
  isReadonlyTupleOrArrayTypeNode(node) ||
  isReadonlyTypeReferenceNode(node) ||
  isPrimitiveTypeNode(node);

export const isReadonlyTupleOrArrayTypeNode = (
  node: tsm.Node,
): node is ReadonlyArrayTypeNode | ReadonlyTupleTypeNode =>
  node.isKind(tsm.SyntaxKind.TypeOperator) &&
  node.getOperator() === tsm.SyntaxKind.ReadonlyKeyword &&
  (node.getTypeNode().isKind(tsm.SyntaxKind.ArrayType) || // Use optional chaining and isKind
    node.getTypeNode().isKind(tsm.SyntaxKind.TupleType));

export type ReadonlyArrayTypeNode = tsm.TypeNode &
  Omit<tsm.TypeOperatorTypeNode, 'getOperator' | 'getTypeNode'> &
  Readonly<{
    getOperator: () => tsm.SyntaxKind.ReadonlyKeyword;
    getTypeNode: () => tsm.ArrayTypeNode;
  }>;

export const isReadonlyArrayTypeNode = (
  node: tsm.Node,
): node is ReadonlyArrayTypeNode =>
  node.isKind(tsm.SyntaxKind.TypeOperator) &&
  node.getOperator() === tsm.SyntaxKind.ReadonlyKeyword &&
  node.getTypeNode().isKind(tsm.SyntaxKind.ArrayType);

// Helper to get a specific type node from source code
const getTypeNodeFromSource = (
  sourceCode: string,
  typeName: string,
): tsm.Node => {
  const project = new tsm.Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('test.ts', sourceCode);
  const typeAlias = sourceFile.getTypeAliasOrThrow(typeName);
  return typeAlias.getTypeNodeOrThrow();
};

if (import.meta.vitest !== undefined) {
  describe('isReadonlyArrayTypeNode', () => {
    test('should return true for readonly array type', () => {
      const node = getTypeNodeFromSource(
        'type Test = readonly number[];',
        'Test',
      );

      if (isReadonlyArrayTypeNode(node)) {
        const _operator = node.getOperator();
        expectType<typeof _operator, tsm.SyntaxKind.ReadonlyKeyword>('=');
        const _typeNode = node.getTypeNode();
        expectType<typeof _typeNode, tsm.ArrayTypeNode>('=');
      }

      expect(node.isKind(tsm.SyntaxKind.TypeOperator)).toBe(true);

      if (!isReadonlyArrayTypeNode(node)) {
        throw new Error('node should be ReadonlyArrayTypeNode');
      }

      expect(node.getOperator()).toBe(tsm.SyntaxKind.ReadonlyKeyword);
      expect(node.getTypeNode().isKind(tsm.SyntaxKind.ArrayType)).toBe(true);
    });

    test('should return false for non-readonly array', () => {
      const node = getTypeNodeFromSource('type Test = string[];', 'Test');
      expect(isReadonlyArrayTypeNode(node)).toBe(false);
    });

    test('should return false for readonly tuple', () => {
      const node = getTypeNodeFromSource(
        'type Test = readonly [string];',
        'Test',
      );
      expect(isReadonlyArrayTypeNode(node)).toBe(false);
    });
  });
}

export type ReadonlyTupleTypeNode = tsm.TypeNode &
  Omit<tsm.TypeOperatorTypeNode, 'getOperator' | 'getTypeNode'> &
  Readonly<{
    getOperator: () => tsm.SyntaxKind.ReadonlyKeyword;
    getTypeNode: () => tsm.TupleTypeNode;
  }>;

export const isReadonlyTupleTypeNode = (
  node: tsm.Node,
): node is ReadonlyTupleTypeNode =>
  node.isKind(tsm.SyntaxKind.TypeOperator) &&
  node.getOperator() === tsm.SyntaxKind.ReadonlyKeyword &&
  node.getTypeNode().isKind(tsm.SyntaxKind.TupleType);

if (import.meta.vitest !== undefined) {
  describe('isReadonlyTupleTypeNode', () => {
    test('should return true for readonly tuple type', () => {
      const node = getTypeNodeFromSource(
        'type Test = readonly [number, string];',
        'Test',
      );
      expect(isReadonlyTupleTypeNode(node)).toBe(true);

      if (isReadonlyTupleTypeNode(node)) {
        const _operator = node.getOperator();
        expectType<typeof _operator, tsm.SyntaxKind.ReadonlyKeyword>('=');
        const _typeNode = node.getTypeNode();
        expectType<typeof _typeNode, tsm.TupleTypeNode>('=');
      }

      expect(node.isKind(tsm.SyntaxKind.TypeOperator)).toBe(true);

      if (!isReadonlyTupleTypeNode(node)) {
        throw new Error('node should be ReadonlyTupleTypeNode');
      }

      expect(node.getOperator()).toBe(tsm.SyntaxKind.ReadonlyKeyword);
      expect(node.getTypeNode().isKind(tsm.SyntaxKind.TupleType)).toBe(true);
    });

    test('should return false for non-readonly tuple', () => {
      const node = getTypeNodeFromSource('type Test = [boolean];', 'Test');
      expect(isReadonlyTupleTypeNode(node)).toBe(false);
    });

    test('should return false for readonly array', () => {
      const node = getTypeNodeFromSource(
        'type Test = readonly number[];',
        'Test',
      );
      expect(isReadonlyTupleTypeNode(node)).toBe(false);
    });
  });
}

export type ReadonlyTypeReferenceNode = tsm.TypeNode &
  Omit<tsm.TypeReferenceNode, 'getTypeName' | 'getTypeArguments'> &
  Readonly<{
    getTypeName: () => Omit<tsm.Identifier, 'getText'> &
      Readonly<{
        getText: () => 'Readonly';
      }>;
    getTypeArguments: () => readonly [tsm.TypeNode];
  }>;

export const isReadonlyTypeReferenceNode = (
  node: tsm.Node,
): node is ReadonlyTypeReferenceNode => {
  if (!node.isKind(tsm.SyntaxKind.TypeReference)) {
    return false;
  }
  const typeName = node.getTypeName();
  const typeArguments = node.getTypeArguments();

  return (
    typeName.isKind(tsm.SyntaxKind.Identifier) &&
    typeName.getText() === 'Readonly' &&
    Arr.isArrayOfLength1(typeArguments)
  );
};

if (import.meta.vitest !== undefined) {
  describe('isReadonlyTypeReferenceNode', () => {
    test('should return true for Readonly<T>', () => {
      const node = getTypeNodeFromSource(
        'type Test = Readonly<{ x: number }>;',
        'Test',
      );
      expect(isReadonlyTypeReferenceNode(node)).toBe(true);
      if (isReadonlyTypeReferenceNode(node)) {
        const _typeNameText = node.getTypeName().getText();
        expectType<typeof _typeNameText, 'Readonly'>('=');
        const _typeArguments = node.getTypeArguments();
        expectType<
          typeof _typeArguments,
          readonly [tsm.TypeNode<tsm.ts.TypeNode>]
        >('=');
      }

      expect(node.isKind(tsm.SyntaxKind.TypeReference)).toBe(true);

      if (!isReadonlyTypeReferenceNode(node)) {
        throw new Error('node should be ReadonlyNode');
      }

      expect(node.getTypeName().getText()).toBe('Readonly');
      expect(node.getTypeArguments()).toHaveLength(1);
    });

    test('should return false for other type references', () => {
      const node = getTypeNodeFromSource(
        'type Test = Partial<{ y: string }>;',
        'Test',
      );
      expect(isReadonlyTypeReferenceNode(node)).toBe(false);
    });

    test('should return false for Readonly without type arguments', () => {
      // Note: This is syntactically incorrect TS, but testing the guard
      const node = getTypeNodeFromSource('type Test = Readonly;', 'Test');
      expect(isReadonlyTypeReferenceNode(node)).toBe(false);
    });

    test('should return false for Readonly with multiple type arguments', () => {
      // Note: This is syntactically incorrect TS, but testing the guard
      const project = new tsm.Project({ useInMemoryFileSystem: true });
      // Need to create manually as TS parser might reject Readonly<A, B>
      const sourceFile = project.createSourceFile(
        'test.ts',
        'type Test = Readonly<string, number>;',
      );
      const node = sourceFile.getTypeAliasOrThrow('Test').getTypeNodeOrThrow();
      expect(isReadonlyTypeReferenceNode(node)).toBe(false);
    });
  });
}
