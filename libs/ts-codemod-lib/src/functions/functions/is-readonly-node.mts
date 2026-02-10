import { Arr, expectType } from 'ts-data-forge';
import * as tsm from 'ts-morph';
import { isAtomicTypeNode } from './is-atomic-type-node.mjs';

export const isShallowReadonlyTypeNode = (node: tsm.Node): boolean =>
  isReadonlyTupleOrArrayTypeNode(node) ||
  isReadonlyTypeReferenceNode(node) ||
  isAtomicTypeNode(node);

export const isReadonlyTupleOrArrayTypeNode = (
  node: DeepReadonly<tsm.Node>,
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
  node: DeepReadonly<tsm.Node>,
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

      assert.isTrue(node.isKind(tsm.SyntaxKind.TypeOperator));

      if (!isReadonlyArrayTypeNode(node)) {
        throw new Error('node should be ReadonlyArrayTypeNode');
      }

      expect(node.getOperator()).toBe(tsm.SyntaxKind.ReadonlyKeyword);

      assert.isTrue(node.getTypeNode().isKind(tsm.SyntaxKind.ArrayType));
    });

    test('should return false for non-readonly array', () => {
      const node = getTypeNodeFromSource('type Test = string[];', 'Test');

      assert.isFalse(isReadonlyArrayTypeNode(node));
    });

    test('should return false for readonly tuple', () => {
      const node = getTypeNodeFromSource(
        'type Test = readonly [string];',
        'Test',
      );

      assert.isFalse(isReadonlyArrayTypeNode(node));
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
  node: DeepReadonly<tsm.Node>,
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

      assert.isTrue(isReadonlyTupleTypeNode(node));

      if (isReadonlyTupleTypeNode(node)) {
        const _operator = node.getOperator();

        expectType<typeof _operator, tsm.SyntaxKind.ReadonlyKeyword>('=');

        const _typeNode = node.getTypeNode();

        expectType<typeof _typeNode, tsm.TupleTypeNode>('=');
      }

      assert.isTrue(node.isKind(tsm.SyntaxKind.TypeOperator));

      if (!isReadonlyTupleTypeNode(node)) {
        throw new Error('node should be ReadonlyTupleTypeNode');
      }

      expect(node.getOperator()).toBe(tsm.SyntaxKind.ReadonlyKeyword);

      assert.isTrue(node.getTypeNode().isKind(tsm.SyntaxKind.TupleType));
    });

    test('should return false for non-readonly tuple', () => {
      const node = getTypeNodeFromSource('type Test = [boolean];', 'Test');

      assert.isFalse(isReadonlyTupleTypeNode(node));
    });

    test('should return false for readonly array', () => {
      const node = getTypeNodeFromSource(
        'type Test = readonly number[];',
        'Test',
      );

      assert.isFalse(isReadonlyTupleTypeNode(node));
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
  node: DeepReadonly<tsm.Node>,
): node is ReadonlyTypeReferenceNode => {
  if (!node.isKind(tsm.SyntaxKind.TypeReference)) {
    return false;
  }

  const typeName = node.getTypeName();

  const typeArguments = node.getTypeArguments();

  return (
    typeName.isKind(tsm.SyntaxKind.Identifier) &&
    typeName.getText() === 'Readonly' &&
    Arr.isArrayOfLength(typeArguments, 1)
  );
};

if (import.meta.vitest !== undefined) {
  describe('isReadonlyTypeReferenceNode', () => {
    test('should return true for Readonly<T>', () => {
      const node = getTypeNodeFromSource(
        'type Test = Readonly<{ x: number }>;',
        'Test',
      );

      assert.isTrue(isReadonlyTypeReferenceNode(node));

      if (isReadonlyTypeReferenceNode(node)) {
        const _typeNameText = node.getTypeName().getText();

        expectType<typeof _typeNameText, 'Readonly'>('=');

        const _typeArguments = node.getTypeArguments();

        expectType<
          typeof _typeArguments,
          readonly [tsm.TypeNode<tsm.ts.TypeNode>]
        >('=');
      }

      assert.isTrue(node.isKind(tsm.SyntaxKind.TypeReference));

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

      assert.isFalse(isReadonlyTypeReferenceNode(node));
    });

    test('should return false for Readonly without type arguments', () => {
      // Note: This is syntactically incorrect TS, but testing the guard
      const node = getTypeNodeFromSource('type Test = Readonly;', 'Test');

      assert.isFalse(isReadonlyTypeReferenceNode(node));
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

      assert.isFalse(isReadonlyTypeReferenceNode(node));
    });
  });
}
