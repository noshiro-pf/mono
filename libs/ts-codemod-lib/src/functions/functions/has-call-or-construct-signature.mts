import * as tsm from 'ts-morph';

/**
 * Determines whether a node is a type literal or an interface that declares a
 * call or construct signature.
 *
 * `Readonly<T>` is a mapped type over `keyof T`, and neither signature kind is a
 * property, so neither survives the mapping: wrapping `{ (x: string): void }`
 * with `Readonly` produces a type that is no longer callable. A type mixing
 * properties with a call signature is worse still — the properties come through
 * and only the signature disappears. So a type literal carrying one must not be
 * wrapped; its members are marked `readonly` in place instead.
 *
 * @param node - The node to check
 * @returns true if the node declares at least one call or construct signature,
 *   false for any other node kind
 */
export const hasCallOrConstructSignature = (node: tsm.Node): boolean =>
  (node.isKind(tsm.SyntaxKind.TypeLiteral) ||
    node.isKind(tsm.SyntaxKind.InterfaceDeclaration)) &&
  node
    .getMembers()
    .some(
      (member) =>
        member.isKind(tsm.SyntaxKind.CallSignature) ||
        member.isKind(tsm.SyntaxKind.ConstructSignature),
    );

if (import.meta.vitest !== undefined) {
  const getFirstNodeOfKind = (
    sourceCode: string,
    kind: tsm.SyntaxKind,
  ): tsm.Node => {
    const project = new tsm.Project({ useInMemoryFileSystem: true });

    const sourceFile = project.createSourceFile('test.ts', sourceCode);

    return sourceFile.getFirstDescendantByKindOrThrow(kind);
  };

  const getTypeLiteral = (sourceCode: string): tsm.Node =>
    getFirstNodeOfKind(sourceCode, tsm.SyntaxKind.TypeLiteral);

  describe('hasCallOrConstructSignature', () => {
    test.each([
      { name: 'call signature', code: 'type T = { (a: string): void };' },
      { name: 'construct signature', code: 'type T = { new (a: string): X };' },
      {
        name: 'call signature mixed with a property',
        code: 'type T = { (a: string): void; b: number };',
      },
      {
        name: 'overloaded call signatures',
        code: 'type T = { (a: string): void; (a: number): void };',
      },
    ])('is true for a type literal with a $name', ({ code }) => {
      assert.isTrue(hasCallOrConstructSignature(getTypeLiteral(code)));
    });

    test.each([
      { name: 'properties only', code: 'type T = { a: number; b: string };' },
      { name: 'an index signature', code: 'type T = { [k: string]: number };' },
      {
        name: 'a method signature',
        code: 'type T = { a(b: string): void };',
      },
      {
        name: 'a function-typed property',
        code: 'type T = { a: (b: string) => void };',
      },
      { name: 'no members', code: 'type T = {};' },
    ])('is false for a type literal with $name', ({ code }) => {
      assert.isFalse(hasCallOrConstructSignature(getTypeLiteral(code)));
    });

    test('is true for an interface with a call signature', () => {
      assert.isTrue(
        hasCallOrConstructSignature(
          getFirstNodeOfKind(
            'interface I { (a: string): void }',
            tsm.SyntaxKind.InterfaceDeclaration,
          ),
        ),
      );
    });

    test('is false for an interface without one', () => {
      assert.isFalse(
        hasCallOrConstructSignature(
          getFirstNodeOfKind(
            'interface I { a: string }',
            tsm.SyntaxKind.InterfaceDeclaration,
          ),
        ),
      );
    });

    test.each([
      {
        name: 'a function type',
        code: 'type T = (a: string) => void;',
        kind: tsm.SyntaxKind.FunctionType,
      },
      {
        name: 'a constructor type',
        code: 'type T = new (a: string) => X;',
        kind: tsm.SyntaxKind.ConstructorType,
      },
      {
        name: 'a class declaration',
        code: 'class C { constructor(a: string) {} }',
        kind: tsm.SyntaxKind.ClassDeclaration,
      },
    ])('is false for $name', ({ code, kind }) => {
      assert.isFalse(
        hasCallOrConstructSignature(getFirstNodeOfKind(code, kind)),
      );
    });
  });
}
