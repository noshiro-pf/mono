import * as ts from 'typescript';

/**
 * Apply `mapFn` to the text of the `interface <name>` declaration in `target`,
 * leaving everything outside that declaration byte-for-byte unchanged.
 *
 * The declaration is located on the syntax tree rather than by a start/end
 * regex, so the scope is exactly the declaration: it does not depend on the
 * formatter keeping `interface X {` on one line or the closing `}` in column 0,
 * and a type parameter list (`interface Int8Array<TArrayBuffer extends ...>`)
 * needs no pattern of its own. Only the position is taken from the tree; the
 * edit is a text splice, so comments and formatting are kept as they are.
 *
 * `mapFn` receives the source text of the declaration from its first token
 * (the leading JSDoc is not included) to its closing brace, and its result
 * replaces that span. The usual leaf is `replaceWithNoMatchCheck`, whose
 * not-found check then applies within the declaration only.
 *
 * Declarations nested in a namespace (`declare namespace Intl { interface
 * Collator { ... } }`) are found too, in source order.
 *
 * Where the name is declared more than once in the file — declaration merging,
 * as `lib.es5.d.ts` does for `String`, `Number` and `Date` to add the `Intl`
 * overloads at its end — only the first declaration in source order is
 * touched, which is also what the start/end regex found.
 *
 * @throws {Error} If the file declares no interface of that name.
 */
export const replaceWithinInterface =
  ({
    name,
    mapFn,
  }: Readonly<{
    name: string;
    mapFn: (declaration: string) => string;
  }>) =>
  (target: string): string => {
    const sourceFile = ts.createSourceFile(
      'lib.d.ts',
      target,
      ts.ScriptTarget.Latest,
      false,
      ts.ScriptKind.TS,
    );

    const declaration = findInterface(sourceFile, name);

    if (declaration === undefined) {
      throw new Error(`interface "${name}" not found.`);
    }

    const start = declaration.getStart(sourceFile);

    const end = declaration.getEnd();

    return `${target.slice(0, start)}${mapFn(target.slice(start, end))}${target.slice(end)}`;
  };

/**
 * The first `interface <name>` declaration under `node` in source order,
 * descending into namespace bodies only (an interface cannot contain another
 * declaration, so nothing else needs walking).
 */
const findInterface = (
  node: ts.Node,
  name: string,
): ts.InterfaceDeclaration | undefined => {
  if (ts.isInterfaceDeclaration(node)) {
    return node.name.text === name ? node : undefined;
  }

  if (
    ts.isSourceFile(node) ||
    ts.isModuleDeclaration(node) ||
    ts.isModuleBlock(node)
  ) {
    return ts.forEachChild(node, (child) => findInterface(child, name));
  }

  return undefined;
};
