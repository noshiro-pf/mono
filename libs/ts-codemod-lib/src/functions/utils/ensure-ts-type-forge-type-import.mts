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
