import * as ts from 'typescript';

export type PrimitiveTypeNode = Readonly<
  | ts.LiteralTypeNode
  | ts.TemplateLiteralTypeNode
  | (ts.TypeNode & {
      kind:
        | ts.SyntaxKind.StringKeyword
        | ts.SyntaxKind.BooleanKeyword
        | ts.SyntaxKind.NumberKeyword
        | ts.SyntaxKind.BigIntKeyword
        | ts.SyntaxKind.SymbolKeyword
        | ts.SyntaxKind.UndefinedKeyword
        | ts.SyntaxKind.VoidKeyword
        | ts.SyntaxKind.AnyKeyword
        | ts.SyntaxKind.UnknownKeyword
        | ts.SyntaxKind.ObjectKeyword
        | ts.SyntaxKind.NeverKeyword;
    })
>;

/**
 * Checks if a given TypeScript node represents a primitive type.
 *
 * @param node - The TypeScript node to check.
 * @returns True if the node represents a primitive type, false otherwise.
 */

/**
 * Determines whether the specified node is a type node that represents a
 * primitive type.
 *
 * @param node The node to check
 * @returns True if it is a primitive type node, false if not
 */
export const isPrimitiveTypeNode = (node: ts.Node): node is PrimitiveTypeNode =>
  // null, "aaa", 1.23, 456n
  ts.isLiteralTypeNode(node) ||
  ts.isTemplateLiteralTypeNode(node) ||
  (ts.isTypeNode(node) &&
    (node.kind === ts.SyntaxKind.StringKeyword ||
      node.kind === ts.SyntaxKind.BooleanKeyword ||
      node.kind === ts.SyntaxKind.NumberKeyword ||
      node.kind === ts.SyntaxKind.BigIntKeyword ||
      node.kind === ts.SyntaxKind.SymbolKeyword ||
      node.kind === ts.SyntaxKind.UndefinedKeyword ||
      node.kind === ts.SyntaxKind.VoidKeyword ||
      node.kind === ts.SyntaxKind.AnyKeyword ||
      node.kind === ts.SyntaxKind.UnknownKeyword ||
      node.kind === ts.SyntaxKind.ObjectKeyword ||
      node.kind === ts.SyntaxKind.NeverKeyword));

if (import.meta.vitest !== undefined) {
  describe('isPrimitiveTypeNode', () => {
    describe('positive cases', () => {
      test.each([
        {
          name: 'string',
          node: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        },
        {
          name: 'number',
          node: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
        },

        {
          name: 'boolean',
          node: ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
        },
        {
          name: 'bigint',
          node: ts.factory.createKeywordTypeNode(ts.SyntaxKind.BigIntKeyword),
        },
        {
          name: 'symbol',
          node: ts.factory.createKeywordTypeNode(ts.SyntaxKind.SymbolKeyword),
        },
        {
          name: 'undefined',
          node: ts.factory.createKeywordTypeNode(
            ts.SyntaxKind.UndefinedKeyword,
          ),
        },
        {
          name: 'null',
          node: ts.factory.createLiteralTypeNode(ts.factory.createNull()),
        },
        {
          name: 'void',
          node: ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
        },
        {
          name: 'any',
          node: ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
        },
        {
          name: 'unknown',
          node: ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        },
        {
          name: 'never',
          node: ts.factory.createKeywordTypeNode(ts.SyntaxKind.NeverKeyword),
        },

        {
          name: 'string literal ("hello")',
          node: ts.factory.createLiteralTypeNode(
            ts.factory.createStringLiteral('hello'),
          ),
        },
        {
          name: 'number literal (123)',
          node: ts.factory.createLiteralTypeNode(
            ts.factory.createNumericLiteral('123'),
          ),
        },
        {
          name: 'bigint literal (123n)',
          node: ts.factory.createLiteralTypeNode(
            ts.factory.createBigIntLiteral('123n'),
          ),
        },
        {
          name: 'boolean literal (true)',
          node: ts.factory.createLiteralTypeNode(ts.factory.createTrue()),
        },
        {
          name: 'boolean literal (false)',
          node: ts.factory.createLiteralTypeNode(ts.factory.createFalse()),
        },
        {
          name: 'TemplateLiteral',
          node: ts.factory.createTemplateLiteralType(
            ts.factory.createTemplateHead(''),
            [],
          ),
        },
      ])('$name', ({ node }) => {
        expect(isPrimitiveTypeNode(node)).toBe(true);
      });
    });

    describe('negative cases', () => {
      test.each([
        {
          name: 'Non-primitive types',
          node: ts.factory.createTypeReferenceNode(
            ts.factory.createIdentifier('Date'),
          ),
        },
        {
          name: 'Non-primitive types',
          node: ts.factory.createArrayTypeNode(
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
          ),
        },
        {
          name: 'Non-primitive types',
          node: ts.factory.createTupleTypeNode([]),
        },
        {
          name: 'Non-primitive types',
          node: ts.factory.createTypeLiteralNode([]),
        },
        {
          name: 'Non-primitive types',
          node: ts.factory.createTypeOperatorNode(
            ts.SyntaxKind.ReadonlyKeyword,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
          ),
        },
        {
          name: 'Non-primitive types',
          node: ts.factory.createUnionTypeNode([]),
        },
        {
          name: 'Non-primitive types',
          node: ts.factory.createIntersectionTypeNode([]),
        },
        {
          name: 'Non-primitive types',
          node: ts.factory.createMappedTypeNode(
            undefined,
            ts.factory.createTypeParameterDeclaration(
              undefined,
              'K',
              undefined,
              undefined,
            ),
            undefined,
            undefined,
            undefined,
            undefined,
          ),
        },
        {
          name: 'Non-primitive types',
          node: ts.factory.createParenthesizedType(
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
          ),
        },
        {
          name: 'Non-primitive types',
          node: ts.factory.createConditionalTypeNode(
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
          ),
        },
        {
          name: 'Non-primitive types',
          node: ts.factory.createIndexedAccessTypeNode(
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
          ),
        },
        {
          name: 'Non-primitive types',
          node: ts.factory.createTypeQueryNode(
            ts.factory.createIdentifier('foo'),
          ),
        },
        {
          name: 'Non-primitive types',
          node: ts.factory.createTypePredicateNode(
            undefined,
            ts.factory.createIdentifier('foo'),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
          ),
        },
        { name: 'Non-primitive types', node: ts.factory.createThisTypeNode() },

        {
          name: 'Non-primitive types',
          node: ts.factory.createInferTypeNode(
            ts.factory.createTypeParameterDeclaration(
              undefined,
              'T',
              undefined,
              undefined,
            ),
          ),
        },

        { name: 'Not a TypeNode', node: ts.factory.createIdentifier('foo') },
        {
          name: 'Not a TypeNode',
          node: ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
              [ts.factory.createVariableDeclaration('foo')],
              ts.NodeFlags.Let,
            ),
          ),
        },
      ])('$name', ({ node }) => {
        expect(isPrimitiveTypeNode(node)).toBe(false);
      });
    });
  });
}
