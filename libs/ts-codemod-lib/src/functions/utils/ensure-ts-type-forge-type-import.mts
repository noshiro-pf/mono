import * as tsm from 'ts-morph';

const TS_TYPE_FORGE_MODULE = 'ts-type-forge';

/**
 * Imports the type `name` from `ts-type-forge`, unless an import of the module
 * already binds that name: into the braces of an existing import of the module
 * where there is one (an `import type` first), or else as a new `import type`
 * declaration — after the last import, else after the directive prologue, else
 * before the first statement and the comments attached to it that are its
 * documentation or an `eslint-disable-next-line`. A shebang, a pragma, a `///`
 * directive and a block comment such as a license stay above it. The line
 * breaks follow the file's, and the quotes those of its last import or
 * directive.
 *
 * Whether the file may take the import is the caller's to decide: an import
 * turns a script into a module, and clashes with a declaration of `name`, or an
 * import of it from another module, that the file already has.
 */
export const ensureTsTypeForgeTypeImport = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.SourceFile,
  name: string,
): void => {
  const text = sourceFile.getFullText();

  // ts-morph writes its line breaks as the project's setting says, so the
  // setting follows the file's for the edit.
  const { manipulationSettings } = sourceFile.getProject();

  const newLineKind = manipulationSettings.getNewLineKind();

  manipulationSettings.set({
    newLineKind: text.includes('\r\n')
      ? tsm.NewLineKind.CarriageReturnLineFeed
      : tsm.NewLineKind.LineFeed,
  });

  try {
    insertTypeImport(sourceFile, text, name);
  } finally {
    manipulationSettings.set({ newLineKind });
  }
};

/**
 * Whether the file has a type reference to `name` (an `extends` or `implements`
 * clause included).
 */
export const referencesTypeName = (node: tsm.ts.Node, name: string): boolean =>
  (tsm.ts.isTypeReferenceNode(node) &&
    tsm.ts.isIdentifier(node.typeName) &&
    node.typeName.text === name) ||
  (tsm.ts.isExpressionWithTypeArguments(node) &&
    tsm.ts.isIdentifier(node.expression) &&
    node.expression.text === name) ||
  (tsm.ts.forEachChild(
    node,
    (child) => referencesTypeName(child, name) || undefined,
  ) ??
    false);

/**
 * Whether the type `name` can be written in the file as it is:
 *
 * - `"in-scope"`: the top level imports it or declares it as a type, or the
 *   file has a type reference to it, which without either relies on a global.
 * - `"taken"`: the top level declares it as a value or a namespace only, which
 *   an import of the name could clash with (an exported one does).
 * - `"free"`: neither; it can be imported.
 *
 * A qualified name (`tf.UnknownRecord`), a property name, the original name of
 * an aliased import (`UnknownRecord as UR`) and a declaration in an inner scope
 * bind nothing at the top level, so they do not count.
 */
export const typeNameScope = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.ts.SourceFile,
  name: string,
): TypeNameScope => {
  const topLevelNames = sourceFile.statements.flatMap(topLevelBindings);

  return topLevelNames.some(
    (binding) => binding.isType && binding.name === name,
  ) || referencesTypeName(sourceFile, name)
    ? 'in-scope'
    : topLevelNames.some((binding) => binding.name === name)
      ? 'taken'
      : 'free';
};

/**
 * What a transformer that writes the `ts-type-forge` type `name` may do in the
 * file: `"write"` the name as it is (it is in scope), `"import"` it with
 * {@link ensureTsTypeForgeTypeImport} (it is free, and the file is a module, so
 * an import does not turn a script's global declarations into a module's), or
 * `"leave"` the file alone (a script, or a file where the name is taken).
 */
export const typeNameUse = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.ts.SourceFile,
  name: string,
): 'write' | 'import' | 'leave' => {
  const scope = typeNameScope(sourceFile, name);

  return scope === 'in-scope'
    ? 'write'
    : scope === 'free' && tsm.ts.isExternalModule(sourceFile)
      ? 'import'
      : 'leave';
};

export type TypeNameScope = 'free' | 'in-scope' | 'taken';

/**
 * The names a top-level statement binds, and whether each can name a type (an
 * import can).
 */
const topLevelBindings = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  statement: tsm.ts.Statement,
): readonly Readonly<{ name: string; isType: boolean }>[] => {
  if (tsm.ts.isImportDeclaration(statement)) {
    const clause = statement.importClause;

    const bindings = clause?.namedBindings;

    // A namespace import cannot name a type.
    const namespaceImport =
      bindings !== undefined && tsm.ts.isNamespaceImport(bindings)
        ? ([{ name: bindings.name.text, isType: false }] as const)
        : ([] as const);

    const named =
      bindings !== undefined && tsm.ts.isNamedImports(bindings)
        ? bindings.elements.map((element) => ({
            name: element.name.text,
            isType: true,
          }))
        : ([] as const);

    const defaultImport =
      clause?.name === undefined
        ? ([] as const)
        : ([{ name: clause.name.text, isType: true }] as const);

    return [...defaultImport, ...namespaceImport, ...named];
  }

  if (tsm.ts.isImportEqualsDeclaration(statement)) {
    return [{ name: statement.name.text, isType: true }];
  }

  if (
    tsm.ts.isTypeAliasDeclaration(statement) ||
    tsm.ts.isInterfaceDeclaration(statement) ||
    tsm.ts.isClassDeclaration(statement) ||
    tsm.ts.isEnumDeclaration(statement)
  ) {
    return statement.name === undefined
      ? []
      : [{ name: statement.name.text, isType: true }];
  }

  if (
    (tsm.ts.isFunctionDeclaration(statement) ||
      tsm.ts.isModuleDeclaration(statement)) &&
    statement.name !== undefined &&
    tsm.ts.isIdentifier(statement.name)
  ) {
    return [{ name: statement.name.text, isType: false }];
  }

  if (tsm.ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.flatMap((declaration) =>
      tsm.ts.isIdentifier(declaration.name)
        ? [{ name: declaration.name.text, isType: false }]
        : [],
    );
  }

  return [];
};

/**
 * `end`, moved past the comments that start on the same line after it: one such
 * as `// eslint-disable-line` is about that line.
 */
const endOfLineComments = (text: string, end: number): number =>
  tsm.ts.getTrailingCommentRanges(text, end)?.at(-1)?.end ?? end;

/**
 * Where a new import goes in a file with no import and no directive prologue:
 * before the first statement, and before the run of JSDoc and `//` comments
 * right above it with no blank line in between (its documentation, an
 * `eslint-disable-next-line`), which belong to it. A comment separated from it
 * by a blank line, a `/* ... *\/` comment (a file-wide `eslint-disable`, a
 * license), a `///` directive, a pragma (`@ts-nocheck`, `@jsxImportSource`),
 * which TypeScript reads only above the first statement, and a shebang stay
 * above the import.
 */
const newImportPosition = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.SourceFile,
  text: string,
): number => {
  const first = sourceFile.getStatements().at(0);

  if (first === undefined) {
    return text.length;
  }

  const comments =
    tsm.ts.getLeadingCommentRanges(text, first.getFullStart()) ?? [];

  let mut_position = first.getStart();

  for (const comment of comments.toReversed()) {
    const commentText = text.slice(comment.pos, comment.end);

    if (
      /\n[^\S\n]*\n/u.test(text.slice(comment.end, mut_position)) ||
      commentText.startsWith('///') ||
      (commentText.startsWith('/*') && !commentText.startsWith('/**')) ||
      /@(?:ts-nocheck|ts-check|jsx)/u.test(commentText)
    ) {
      break;
    }

    mut_position = comment.pos;
  }

  return mut_position;
};

/** The leading `'use client';`-like statements of the file. */
const directivePrologue = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.SourceFile,
): readonly tsm.ts.Statement[] => {
  const statements = sourceFile.compilerNode.statements;

  const end = statements.findIndex(
    (statement) =>
      !(
        tsm.ts.isExpressionStatement(statement) &&
        tsm.ts.isStringLiteral(statement.expression)
      ),
  );

  return statements.slice(0, end === -1 ? statements.length : end);
};

const insertTypeImport = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceFile: tsm.SourceFile,
  text: string,
  name: string,
): void => {
  const imports = sourceFile.getImportDeclarations();

  const moduleImports = imports.filter(
    (decl) => decl.getModuleSpecifierValue() === TS_TYPE_FORGE_MODULE,
  );

  const alreadyImported = moduleImports.some((decl) =>
    decl
      .getNamedImports()
      .some(
        (ni) =>
          ni.getName() === name &&
          (ni.getAliasNode()?.getText() ?? name) === name,
      ),
  );

  if (alreadyImported) {
    return;
  }

  // A namespace import has no braces to take the name.
  const hosts = moduleImports.filter((decl) =>
    tsm.Node.isNamedImports(decl.getImportClause()?.getNamedBindings()),
  );

  const host = hosts.find((decl) => decl.isTypeOnly()) ?? hosts.at(0);

  if (host !== undefined) {
    // `import type { ..., type X }` is an error: the declaration already makes
    // every name type-only.
    host.addNamedImport({ name, isTypeOnly: !host.isTypeOnly() });

    return;
  }

  const lastImport = imports.at(-1);

  const lastDirective = directivePrologue(sourceFile).at(-1);

  const quote =
    (
      lastImport?.getModuleSpecifier().getText() ??
      lastDirective?.getText(sourceFile.compilerNode)
    )?.at(0) ?? "'";

  // `import type`, not `import { type X }`, which `verbatimModuleSyntax` keeps
  // as `import {} from 'ts-type-forge'`, a module with nothing to run.
  const declaration =
    `import type { ${name} } from ${quote}${TS_TYPE_FORGE_MODULE}${quote};` as const;

  const anchorEnd = lastImport?.getEnd() ?? lastDirective?.end;

  if (anchorEnd === undefined) {
    sourceFile.insertText(
      newImportPosition(sourceFile, text),
      `${declaration}\n\n`,
    );
  } else {
    sourceFile.insertText(
      endOfLineComments(text, anchorEnd),
      `\n${declaration}`,
    );
  }
};
