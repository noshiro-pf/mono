import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as ts from 'typescript';

describe('node-version-gated-apis.mts', () => {
  test('imports nothing', async () => {
    // Node.js loads this repository's `tools/configs/oxlint-rules.mts`, which
    // reads this module from source with nothing built, so a runtime import
    // here (a lint fix once added `Arr` from `ts-data-forge`) breaks oxlint
    // wherever `dist/` is missing.
    const source = await fs.readFile(
      path.join(import.meta.dirname, 'node-version-gated-apis.mts'),
      'utf8',
    );

    assert.deepStrictEqual(valueImports(source), []);
  });

  // Read from the syntax tree rather than the text, which a comment holding the
  // word `from` after an `export const` once matched (#3462).
  test('the check reads a comment as a comment', () => {
    assert.deepStrictEqual(
      valueImports(
        [
          'export const a = 1; // read from the table',
          "import type { T } from 'x';",
          "export type { U } from 'y';",
        ].join('\n'),
      ),
      [],
    );

    assert.deepStrictEqual(
      valueImports(
        [
          "import { a } from 'a';",
          "export { b } from 'b';",
          "import 'c';",
          "const d = await import('d');",
        ].join('\n'),
      ),
      ['a', 'b', 'c', 'd'],
    );
  });
});

/**
 * What a node imports or re-exports at run time, or `undefined` when it is no
 * such node or one that is erased.
 */
const moduleSpecifierOf = (node: ts.Node): ts.Node | undefined => {
  if (ts.isImportDeclaration(node)) {
    return node.importClause?.phaseModifier === ts.SyntaxKind.TypeKeyword
      ? undefined
      : node.moduleSpecifier;
  }

  if (ts.isExportDeclaration(node)) {
    return node.isTypeOnly ? undefined : node.moduleSpecifier;
  }

  return ts.isCallExpression(node) &&
    node.expression.kind === ts.SyntaxKind.ImportKeyword
    ? (node.arguments[0] ?? node)
    : undefined;
};

/**
 * The modules a source imports or re-exports at run time: `import type` and
 * `export type` are erased, and are left out.
 */
const valueImports = (source: string): readonly string[] => {
  const file = ts.createSourceFile('x.mts', source, ts.ScriptTarget.Latest);

  const mut_found: string[] = [];

  const visit = (node: ts.Node): void => {
    const specifier = moduleSpecifierOf(node);

    if (specifier !== undefined) {
      mut_found.push(
        ts.isStringLiteral(specifier) ? specifier.text : '<dynamic>',
      );
    }

    ts.forEachChild(node, visit);
  };

  visit(file);

  return mut_found;
};
