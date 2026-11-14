/** The modules a module's source loads at run time, as written. */

import ts from 'typescript';
import { skipExpressionWrappers } from './ts-expression-wrappers.mjs';

/**
 * The specifiers a module's source imports at run time, in order: every
 * `import` and `export … from` (`export * as`, `import defer` included),
 * `import … = require(…)`, and `import(…)` and `require(…)` with a string
 * literal, less `import type`, `export type`, an `import(…)` type and what a
 * `declare module '…'` imports, which load nothing. A `from '…'` in a comment
 * or a string is not one.
 */
export const runtimeImportSpecifiers = (
  source: string,
  fileName: string = 'config.mts',
): readonly string[] =>
  // The name's extension picks how it is parsed: JSX in a `.tsx` or `.jsx`.
  runtimeImportSpecifiersOf(
    ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest),
  );

/**
 * {@link runtimeImportSpecifiers}, of a module already parsed: of its
 * `SourceFile`, or of the part of it under any other node.
 */
export const runtimeImportSpecifiersOf = (root: ts.Node): readonly string[] => {
  // Every node, as an `import()` or `require()` may sit in any function. Not
  // shared with the walk in `check-changed/import-graph.mts`, which asks which
  // static imports a generator's inputs reach, a question with other answers.
  const mut_specifiers: string[] = [];

  const visit = (node: ts.Node): void => {
    const specifier = runtimeSpecifierOf(node);

    if (specifier !== undefined) {
      mut_specifiers.push(specifier);
    }

    // What an ambient `declare module '…'` imports loads nothing.
    if (!(ts.isModuleDeclaration(node) && ts.isStringLiteral(node.name))) {
      ts.forEachChild(node, visit);
    }
  };

  visit(root);

  return mut_specifiers;
};

/** Whether a call's callee is `import` or `require`, seen through wrappers. */
const isImportCallee = (callee: ts.Node): boolean => {
  const unwrapped = skipExpressionWrappers(callee);

  // A function `createRequire` returns is not followed under any other name:
  // telling it apart needs the binding, and no module here makes one. Nor is
  // `require.resolve(…)` or `import.meta.resolve(…)`, which name a path.
  return (
    unwrapped.kind === ts.SyntaxKind.ImportKeyword ||
    (ts.isIdentifier(unwrapped) && unwrapped.text === 'require')
  );
};

/** The specifier expression of an import that loads at run time. */
const loadedSpecifierOf = (node: ts.Node): ts.Node | undefined => {
  if (ts.isImportDeclaration(node)) {
    return node.importClause?.phaseModifier === ts.SyntaxKind.TypeKeyword
      ? undefined
      : node.moduleSpecifier;
  }

  if (ts.isExportDeclaration(node)) {
    return node.isTypeOnly ? undefined : node.moduleSpecifier;
  }

  if (ts.isImportEqualsDeclaration(node)) {
    return node.isTypeOnly ||
      !ts.isExternalModuleReference(node.moduleReference)
      ? undefined
      : node.moduleReference.expression;
  }

  return ts.isCallExpression(node) && isImportCallee(node.expression)
    ? node.arguments[0]
    : undefined;
};

/**
 * The specifier `node` loads at run time, if it is an import that does. One
 * whose bindings are all inline `type` (`import { type A } from 'a'`) counts:
 * whether it loads depends on the loader (type stripping keeps it), and
 * counting it can only lint more. A computed `import(…)` is not one: no static
 * reading could follow it, and no module here makes one.
 */
const runtimeSpecifierOf = (node: ts.Node): string | undefined => {
  const specifier = loadedSpecifierOf(node);

  const literal =
    specifier === undefined ? undefined : skipExpressionWrappers(specifier);

  return literal !== undefined && ts.isStringLiteralLike(literal)
    ? literal.text
    : undefined;
};
