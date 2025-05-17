import { ISet } from '@noshiro/ts-utils';
import * as tsm from 'ts-morph';

// Define the set of SyntaxKinds that represent primitive type keywords
const primitiveKeywordKinds = ISet.new<tsm.SyntaxKind>([
  tsm.SyntaxKind.StringKeyword,
  tsm.SyntaxKind.BooleanKeyword,
  tsm.SyntaxKind.NumberKeyword,
  tsm.SyntaxKind.BigIntKeyword,
  tsm.SyntaxKind.SymbolKeyword,
  tsm.SyntaxKind.UndefinedKeyword,
  tsm.SyntaxKind.VoidKeyword,
  tsm.SyntaxKind.AnyKeyword,
  tsm.SyntaxKind.UnknownKeyword,
  tsm.SyntaxKind.ObjectKeyword, // Note: 'object' is sometimes considered primitive in TS type system context
  tsm.SyntaxKind.NeverKeyword,
]);

export type PrimitiveTypeNode = tsm.Node &
  Readonly<
    | tsm.LiteralTypeNode
    | tsm.TemplateLiteralTypeNode
    | (tsm.TypeNode & {
        kind:
          | tsm.SyntaxKind.StringKeyword
          | tsm.SyntaxKind.BooleanKeyword
          | tsm.SyntaxKind.NumberKeyword
          | tsm.SyntaxKind.BigIntKeyword
          | tsm.SyntaxKind.SymbolKeyword
          | tsm.SyntaxKind.UndefinedKeyword
          | tsm.SyntaxKind.VoidKeyword
          | tsm.SyntaxKind.AnyKeyword
          | tsm.SyntaxKind.UnknownKeyword
          | tsm.SyntaxKind.ObjectKeyword
          | tsm.SyntaxKind.NeverKeyword;
      })
  >;

/**
 * Checks if a given ts-morph node represents a primitive type node.
 * This includes keyword types (string, number, etc.), literal types (null, "abc", 123),
 * and template literal types.
 *
 * @param node - The ts-morph node to check.
 * @returns True if the node represents a primitive type node, false otherwise.
 *          Acts as a type guard.
 */
export const isPrimitiveTypeNode = (
  node: tsm.Node,
): node is PrimitiveTypeNode => {
  // Check for literal types (null, "aaa", 1.23, 456n, true, false)
  if (node.isKind(tsm.SyntaxKind.LiteralType)) {
    return true;
  }

  // Check for template literal types (`abc${expr}def`)
  if (node.isKind(tsm.SyntaxKind.TemplateLiteralType)) {
    return true;
  }

  // Check if it's a TypeNode and its kind is one of the primitive keywords
  // Node.isTypeNode(node) ensures we only check nodes that represent types
  // if (ts.Node.isTypeNode(node) && primitiveKeywordKinds.has(node.getKind())) {
  if (primitiveKeywordKinds.has(node.getKind())) {
    return true;
  }

  return false;
};

if (import.meta.vitest !== undefined) {
  // Helper to get a specific type node from source code
  const getTypeNodeFromSource = (
    sourceCode: string,
    typeName: string,
  ): tsm.TypeNode => {
    const project = new tsm.Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile('test.ts', sourceCode);
    const typeAlias = sourceFile.getTypeAliasOrThrow(typeName);
    return typeAlias.getTypeNodeOrThrow();
  };

  // Helper to get the first node of a specific kind from source code
  const getFirstNodeOfKind = <T extends tsm.Node>(
    sourceCode: string,
    kind: tsm.SyntaxKind,
  ): T | undefined => {
    const project = new tsm.Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile('test.ts', sourceCode);
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return sourceFile.getFirstDescendantByKind(kind) as T | undefined;
  };

  describe('isPrimitiveTypeNode', () => {
    describe('positive cases', () => {
      test.each([
        {
          name: 'string',
          code: 'type Test = string;',
          kind: tsm.SyntaxKind.StringKeyword,
        },
        {
          name: 'number',
          code: 'type Test = number;',
          kind: tsm.SyntaxKind.NumberKeyword,
        },
        {
          name: 'boolean',
          code: 'type Test = boolean;',
          kind: tsm.SyntaxKind.BooleanKeyword,
        },
        {
          name: 'bigint',
          code: 'type Test = bigint;',
          kind: tsm.SyntaxKind.BigIntKeyword,
        },
        {
          name: 'symbol',
          code: 'type Test = symbol;',
          kind: tsm.SyntaxKind.SymbolKeyword,
        },
        {
          name: 'undefined',
          code: 'type Test = undefined;',
          kind: tsm.SyntaxKind.UndefinedKeyword,
        },
        {
          name: 'void',
          code: 'type Test = void;',
          kind: tsm.SyntaxKind.VoidKeyword,
        },
        {
          name: 'any',
          code: 'type Test = any;',
          kind: tsm.SyntaxKind.AnyKeyword,
        },
        {
          name: 'unknown',
          code: 'type Test = unknown;',
          kind: tsm.SyntaxKind.UnknownKeyword,
        },
        {
          name: 'never',
          code: 'type Test = never;',
          kind: tsm.SyntaxKind.NeverKeyword,
        },
        {
          name: 'object',
          code: 'type Test = object;',
          kind: tsm.SyntaxKind.ObjectKeyword,
        }, // Included based on original code
        {
          name: 'null',
          code: 'type Test = null;',
          kind: tsm.SyntaxKind.LiteralType,
        },
        {
          name: 'string literal ("hello")',
          code: 'type Test = "hello";',
          kind: tsm.SyntaxKind.LiteralType,
        },
        {
          name: 'number literal (123)',
          code: 'type Test = 123;',
          kind: tsm.SyntaxKind.LiteralType,
        },
        {
          name: 'bigint literal (123n)',
          code: 'type Test = 123n;',
          kind: tsm.SyntaxKind.LiteralType,
        },
        {
          name: 'boolean literal (true)',
          code: 'type Test = true;',
          kind: tsm.SyntaxKind.LiteralType,
        },
        {
          name: 'boolean literal (false)',
          code: 'type Test = false;',
          kind: tsm.SyntaxKind.LiteralType,
        },
        {
          name: 'TemplateLiteral',
          // eslint-disable-next-line no-template-curly-in-string
          code: 'type Test = `a${string}b`;',
          kind: tsm.SyntaxKind.TemplateLiteralType,
        },
      ])('$name', ({ code, kind }) => {
        const node = getTypeNodeFromSource(code, 'Test');
        expect(node.getKind()).toBe(kind);
        expect(isPrimitiveTypeNode(node)).toBe(true);
      });
    });

    describe('negative cases', () => {
      test.each([
        {
          name: 'Date TypeReference',
          code: 'type Test = Date;',
          kind: tsm.SyntaxKind.TypeReference,
        },
        {
          name: 'Array Type',
          code: 'type Test = number[];',
          kind: tsm.SyntaxKind.ArrayType,
        },
        {
          name: 'Tuple Type',
          code: 'type Test = [string, number];',
          kind: tsm.SyntaxKind.TupleType,
        },
        {
          name: 'Type Literal',
          code: 'type Test = { a: number };',
          kind: tsm.SyntaxKind.TypeLiteral,
        },
        {
          name: 'Readonly Type Operator',
          code: 'type Test = readonly string[];',
          kind: tsm.SyntaxKind.TypeOperator,
        },
        {
          name: 'Union Type',
          code: 'type Test = string | number;',
          kind: tsm.SyntaxKind.UnionType,
        },
        {
          name: 'Intersection Type',
          code: 'type Test = A & B;',
          kind: tsm.SyntaxKind.IntersectionType,
        },
        {
          name: 'Mapped Type',
          code: 'type Test = { [K in keyof T]: T[K] };',
          kind: tsm.SyntaxKind.MappedType,
        }, // Needs T defined
        {
          name: 'Parenthesized Type',
          code: 'type Test = (string);',
          kind: tsm.SyntaxKind.ParenthesizedType,
        },
        {
          name: 'Conditional Type',
          code: 'type Test = T extends U ? X : Y;',
          kind: tsm.SyntaxKind.ConditionalType,
        }, // Needs T, U, X, Y
        {
          name: 'Indexed Access Type',
          code: 'type Test = T[K];',
          kind: tsm.SyntaxKind.IndexedAccessType,
        }, // Needs T, K
        {
          name: 'Type Query (typeof)',
          code: 'type Test = typeof myVar;',
          kind: tsm.SyntaxKind.TypeQuery,
        },
      ])('$name', ({ code, kind }) => {
        const node = getTypeNodeFromSource(code, 'Test');
        expect(node.getKind()).toBe(kind); // Verify node type
        expect(isPrimitiveTypeNode(node)).toBe(false);
      });

      test.each([
        {
          name: 'Type Predicate',
          code: 'function isString(x: any): x is string { return typeof x === "string"; }',
          kind: tsm.SyntaxKind.TypePredicate,
        }, // Node is part of function sig
        {
          name: 'This Type',
          code: 'class C { method(): this {} }',
          kind: tsm.SyntaxKind.ThisType,
        }, // Node is part of method sig
        {
          name: 'Infer Type',
          code: 'type Test<T> = T extends Promise<infer R> ? R : T;',
          kind: tsm.SyntaxKind.InferType,
        }, // Needs context
      ])('$name (not a type node)', ({ code, kind }) => {
        const node = getFirstNodeOfKind(code, kind);
        expect(node).toBeDefined();
        if (node === undefined) {
          throw new Error('Node should be defined');
        }
        expect(isPrimitiveTypeNode(node)).toBe(false);
      });
    });
  });
}
