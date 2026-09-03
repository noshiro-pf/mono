import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isNotUndefined, Result, unknownToString } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';
import { glob } from './glob.mjs';

/**
 * Removes development-only code from a built JavaScript module.
 *
 * The source files of the libraries in this repository carry code that only
 * exists for the type checker and the test runner: `expectType<A, B>('=')`
 * assertions, the `if (<import.meta>.vitest !== undefined) { ... }` blocks
 * holding in-source tests, and calls to identity functions such as `castMutable`
 * whose only purpose is to change the static type of their argument. The
 * compiler emits all of it as-is. This pass removes it from the emitted
 * `.mjs`, so that a bundler and its tree-shaking are not needed to keep it
 * out of the published package.
 *
 * What is removed:
 *
 * - An `if` statement whose condition is exactly the in-source test guard
 *   (`<import.meta>.vitest !== undefined`) and which has no `else`, together
 *   with everything inside it.
 * - An expression statement that is a call to one of
 *   `options.removeCallStatements` (`expectType` by default), e.g.
 *   `expectType('=');`.
 * - A block, loop, labeled statement or `if` whose body became empty because
 *   every statement in it was removed by this pass. A body that was already
 *   empty in the source is left alone.
 * - A call to one of `options.unwrapIdentityCalls` with exactly one argument,
 *   which is replaced by its argument: `castMutable(xs)` becomes `xs`. The
 *   parentheses stay where the argument needs them
 *   (`castMutable(a ?? b).x` becomes `(a ?? b).x`), so precedence is
 *   unaffected.
 * - An import binding that nothing outside the removed code refers to any
 *   more, and the whole `import` declaration when it has no bindings left.
 *
 * Every line break is kept when a range is removed, so the line numbers of
 * the output are the line numbers of the input and the source map the
 * compiler emitted for the file stays valid line for line. What follows a
 * removed range on the same line shifts left, which happens on an `import`
 * line or around an unwrapped cast and nowhere else.
 *
 * It fails rather than leaving something behind: a removable call in a
 * position it cannot remove (`() => expectType('=')`, an argument, an
 * operand) or a `<import.meta>.vitest` outside the guard it recognizes is
 * reported as an error, so that a shape the pass does not know about breaks
 * the build instead of shipping.
 *
 * (`<import.meta>.vitest` stands for that property access written out: this
 * module must not contain it verbatim, because Vitest takes any source file
 * that does for an in-source test file and fails it for having no tests.)
 *
 * @param source - Contents of the emitted JavaScript module.
 * @param fileName - Name of the file, used in error messages.
 * @param options - See {@link StripDevOnlyCodeOptions}.
 * @returns The stripped source, or the reason it could not be stripped.
 */
export const stripDevOnlyCode = (
  source: string,
  fileName: string,
  options?: StripDevOnlyCodeOptions,
): Result<string, string> => {
  const removeCallStatements = new Set(
    options?.removeCallStatements ?? defaultRemoveCallStatements,
  );

  const unwrapIdentityCalls = new Set(
    options?.unwrapIdentityCalls ?? defaultUnwrapIdentityCalls,
  );

  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.JS,
  );

  const statementRanges = collectRemovedStatements(
    sourceFile,
    createIsRemovable(removeCallStatements),
  );

  const leftover = findLeftover(
    sourceFile,
    removeCallStatements,
    isErasedBy(statementRanges),
    fileName,
  );

  if (leftover !== undefined) {
    return Result.err(leftover);
  }

  const calleeRanges = collectUnwrappedCallees(
    sourceFile,
    unwrapIdentityCalls,
    isErasedBy(statementRanges),
  );

  const importRanges = collectUnusedImports(
    sourceFile,
    isErasedBy([...statementRanges, ...calleeRanges]),
  );

  return Result.ok(
    eraseRanges(source, [...statementRanges, ...calleeRanges, ...importRanges]),
  );
};

/**
 * Applies {@link stripDevOnlyCode} to every `.mjs` file under `dir`, writing
 * back the files that changed.
 *
 * @param dir - Directory to walk, typically a package's `dist/`.
 * @param options - See {@link StripDevOnlyCodeOptions}.
 * @returns How many files were rewritten, or the first error encountered.
 */
export const stripDevOnlyCodeInDir = async (
  dir: string,
  options?: StripDevOnlyCodeOptions,
): Promise<Result<Readonly<{ changedFiles: number }>, string>> => {
  const globResult = await glob('**/*.mjs', { cwd: dir, absolute: true });

  if (Result.isErr(globResult)) {
    return Result.err(
      `Failed to list files under ${dir}: ${unknownToString(globResult.value)}`,
    );
  }

  const files = globResult.value.toSorted();

  const stripped = await Promise.all(
    files.map(async (file) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const original = await fs.readFile(file, 'utf8');

      return {
        file,
        original,
        result: stripDevOnlyCode(original, path.relative(dir, file), options),
      };
    }),
  );

  const firstError = stripped.find(({ result }) => Result.isErr(result));

  if (firstError !== undefined && Result.isErr(firstError.result)) {
    return Result.err(firstError.result.value);
  }

  const changed = stripped.filter(
    ({ original, result }) => Result.isOk(result) && result.value !== original,
  );

  await Promise.all(
    changed.map(({ file, result }) =>
      Result.isOk(result)
        ? // eslint-disable-next-line security/detect-non-literal-fs-filename
          fs.writeFile(file, result.value)
        : Promise.resolve(),
    ),
  );

  return Result.ok({ changedFiles: changed.length });
};

export type StripDevOnlyCodeOptions = Readonly<{
  /**
   * Functions whose call statements are removed. A call to one of these in
   * any other position is an error.
   *
   * @default ['expectType']
   */
  removeCallStatements?: readonly string[];

  /**
   * Identity functions whose calls are replaced by their single argument.
   * Only list functions that return their argument unchanged: a function
   * that validates at runtime, such as `asUint32`, is not one of these.
   *
   * @default ['castMutable', 'castDeepMutable', 'castReadonly', 'castDeepReadonly']
   */
  unwrapIdentityCalls?: readonly string[];
}>;

const defaultRemoveCallStatements = ['expectType'] as const;

/** See the note at the top of the file for why this is not a literal. */
const importMetaVitest = ['import.meta', 'vitest'].join('.');

const defaultUnwrapIdentityCalls = [
  'castMutable',
  'castDeepMutable',
  'castReadonly',
  'castDeepReadonly',
] as const;

/** `[start, end)` positions in the source text. */
type EraseRange = readonly [start: number, end: number];

type IsRemovable = (statement: DeepReadonly<ts.Statement>) => boolean;

type IsErased = (pos: number) => boolean;

const isErasedBy =
  (ranges: readonly EraseRange[]): IsErased =>
  (pos) =>
    ranges.some(([start, end]) => start <= pos && pos < end);

/**
 * Decides whether a statement is removed as a whole. A compound statement is
 * removed when its body is: a block all of whose statements are removable, a
 * loop whose body is, an `if` whose branches all are.
 */
const createIsRemovable = (
  removeCallStatements: ReadonlySet<string>,
): IsRemovable => {
  const isRemovable = (statement: DeepReadonly<ts.Statement>): boolean => {
    if (isVitestGuard(statement)) {
      return true;
    }

    if (
      ts.isExpressionStatement(statement) &&
      isCallOf(statement.expression, removeCallStatements)
    ) {
      return true;
    }

    if (ts.isBlock(statement)) {
      return (
        Arr.isNonEmpty(statement.statements) &&
        statement.statements.every(isRemovable)
      );
    }

    if (
      ts.isForStatement(statement) ||
      ts.isForOfStatement(statement) ||
      ts.isForInStatement(statement) ||
      ts.isWhileStatement(statement) ||
      ts.isDoStatement(statement) ||
      ts.isLabeledStatement(statement)
    ) {
      return isRemovable(statement.statement);
    }

    if (ts.isIfStatement(statement)) {
      return (
        isRemovable(statement.thenStatement) &&
        (statement.elseStatement === undefined ||
          isRemovable(statement.elseStatement))
      );
    }

    return false;
  };

  return isRemovable;
};

/** `if (<import.meta>.vitest !== undefined) { ... }` with no `else`. */
const isVitestGuard = (statement: DeepReadonly<ts.Statement>): boolean =>
  ts.isIfStatement(statement) &&
  statement.elseStatement === undefined &&
  ts.isBinaryExpression(statement.expression) &&
  statement.expression.operatorToken.kind ===
    ts.SyntaxKind.ExclamationEqualsEqualsToken &&
  isImportMetaVitest(statement.expression.left) &&
  ts.isIdentifier(statement.expression.right) &&
  statement.expression.right.text === 'undefined';

const isImportMetaVitest = (node: ts.Node): boolean =>
  ts.isPropertyAccessExpression(node) &&
  node.name.text === 'vitest' &&
  ts.isMetaProperty(node.expression) &&
  node.expression.keywordToken === ts.SyntaxKind.ImportKeyword &&
  node.expression.name.text === 'meta';

const isCallOf = (
  node: ts.Node,
  names: ReadonlySet<string>,
): node is ts.CallExpression =>
  ts.isCallExpression(node) &&
  ts.isIdentifier(node.expression) &&
  names.has(node.expression.text);

const hasStatements = (
  node: ts.Node,
): node is
  | ts.Block
  | ts.CaseClause
  | ts.DefaultClause
  | ts.ModuleBlock
  | ts.SourceFile =>
  ts.isSourceFile(node) ||
  ts.isBlock(node) ||
  ts.isModuleBlock(node) ||
  ts.isCaseClause(node) ||
  ts.isDefaultClause(node);

/**
 * Walks the tree looking for statement lists, and in each one erases the
 * removable statements and descends into the rest.
 */
const collectRemovedStatements = (
  sourceFile: DeepReadonly<ts.SourceFile>,
  isRemovable: IsRemovable,
): readonly EraseRange[] => {
  const mut_ranges: EraseRange[] = [];

  const visit = (node: ts.Node): void => {
    if (hasStatements(node)) {
      for (const [index, statement] of node.statements.entries()) {
        if (isRemovable(statement)) {
          mut_ranges.push([
            statementEraseStart(statement, node, index, sourceFile),
            statement.getEnd(),
          ]);
        } else {
          visit(statement);
        }
      }

      return;
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return mut_ranges;
};

/**
 * A removed statement takes its leading comments with it, except that the
 * first statement of a file keeps whatever precedes it: that is the file
 * header, not a comment on the statement.
 */
const statementEraseStart = (
  statement: DeepReadonly<ts.Statement>,
  parent: ts.Node,
  index: number,
  sourceFile: DeepReadonly<ts.SourceFile>,
): number =>
  index === 0 && ts.isSourceFile(parent)
    ? statement.getStart(sourceFile)
    : statement.getFullStart();

/**
 * Finds a removable call or a `<import.meta>.vitest` that survived the
 * statement pass, which means it sits somewhere the pass does not handle.
 */
const findLeftover = (
  sourceFile: DeepReadonly<ts.SourceFile>,
  removeCallStatements: ReadonlySet<string>,
  isErased: IsErased,
  fileName: string,
): string | undefined => {
  const mut_result: { current: string | undefined } = { current: undefined };

  const visit = (node: ts.Node): void => {
    if (mut_result.current !== undefined) {
      return;
    }

    if (isErased(node.getStart(sourceFile))) {
      return;
    }

    if (isCallOf(node, removeCallStatements)) {
      mut_result.current = describeLeftover(
        `a call to \`${node.expression.getText(sourceFile)}\` is not a statement on its own and cannot be removed`,
        node,
        sourceFile,
        fileName,
      );

      return;
    }

    if (isImportMetaVitest(node)) {
      mut_result.current = describeLeftover(
        `\`${importMetaVitest}\` is used outside an \`if (${importMetaVitest} !== undefined) { ... }\` guard`,
        node,
        sourceFile,
        fileName,
      );

      return;
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return mut_result.current;
};

const describeLeftover = (
  message: string,
  node: ts.Node,
  sourceFile: DeepReadonly<ts.SourceFile>,
  fileName: string,
): string => {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(
    node.getStart(sourceFile),
  );

  return `${fileName}:${line + 1}:${character + 1}: ${message}`;
};

/**
 * Erases `f(` and `)` around the argument of every identity function `f`,
 * or only the `f` when the argument needs the parentheses to keep its
 * meaning.
 */
const collectUnwrappedCallees = (
  sourceFile: DeepReadonly<ts.SourceFile>,
  unwrapIdentityCalls: ReadonlySet<string>,
  isErased: IsErased,
): readonly EraseRange[] => {
  const mut_ranges: EraseRange[] = [];

  const visit = (node: ts.Node): void => {
    if (isErased(node.getStart(sourceFile))) {
      return;
    }

    if (
      isCallOf(node, unwrapIdentityCalls) &&
      node.questionDotToken === undefined
    ) {
      const argument =
        node.arguments.length === 1 ? node.arguments[0] : undefined;

      if (argument !== undefined && !ts.isSpreadElement(argument)) {
        if (standsAloneWithoutParentheses(argument)) {
          mut_ranges.push(
            [
              node.expression.getStart(sourceFile),
              argument.getStart(sourceFile),
            ],
            [argument.getEnd(), node.getEnd()],
          );
        } else {
          mut_ranges.push([
            node.expression.getStart(sourceFile),
            node.expression.getEnd(),
          ]);
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return mut_ranges;
};

/**
 * Whether an expression reads the same in any position without parentheses
 * around it. Only the forms that bind tighter than anything around them
 * qualify; an object literal is left out because `() => ({ a })` needs its
 * parentheses, and a function or class expression because a statement
 * starting with one would become a declaration.
 */
const standsAloneWithoutParentheses = (
  node: DeepReadonly<ts.Expression>,
): boolean =>
  ts.isIdentifier(node) ||
  ts.isPropertyAccessExpression(node) ||
  ts.isElementAccessExpression(node) ||
  ts.isCallExpression(node) ||
  ts.isParenthesizedExpression(node) ||
  ts.isArrayLiteralExpression(node) ||
  ts.isStringLiteral(node) ||
  ts.isNumericLiteral(node) ||
  ts.isNoSubstitutionTemplateLiteral(node) ||
  ts.isTemplateExpression(node) ||
  node.kind === ts.SyntaxKind.ThisKeyword ||
  node.kind === ts.SyntaxKind.TrueKeyword ||
  node.kind === ts.SyntaxKind.FalseKeyword ||
  node.kind === ts.SyntaxKind.NullKeyword;

/**
 * Erases import bindings that no identifier outside the erased ranges refers
 * to. The reference count is deliberately generous: a shadowing local
 * variable, a label or a shorthand property of the same name all count as
 * references, so the worst case is a dead import that stays.
 */
const collectUnusedImports = (
  sourceFile: DeepReadonly<ts.SourceFile>,
  isErased: IsErased,
): readonly EraseRange[] => {
  const referencedNames = collectReferencedNames(sourceFile, isErased);

  const isUnused = (name: string): boolean => !referencedNames.has(name);

  const mut_ranges: EraseRange[] = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) {
      continue;
    }

    const clause = statement.importClause;

    if (clause === undefined) {
      // `import 'x';` is there for its side effects.
      continue;
    }

    const defaultName = clause.name;

    const namedBindings = clause.namedBindings;

    if (namedBindings === undefined || ts.isNamespaceImport(namedBindings)) {
      const bindings = [defaultName, namedBindings?.name].filter(
        isNotUndefined,
      );

      if (
        Arr.isNonEmpty(bindings) &&
        bindings.every((binding) => isUnused(binding.text))
      ) {
        mut_ranges.push([statement.getStart(sourceFile), statement.getEnd()]);
      }

      continue;
    }

    const specifiers = namedBindings.elements;

    if (!Arr.isNonEmpty(specifiers)) {
      continue;
    }

    if (specifiers.every((s) => isUnused(s.name.text))) {
      if (defaultName === undefined || isUnused(defaultName.text)) {
        mut_ranges.push([statement.getStart(sourceFile), statement.getEnd()]);
      } else {
        // `import def, { a, b } from 'x'` -> `import def from 'x'`
        mut_ranges.push([defaultName.getEnd(), namedBindings.getEnd()]);
      }

      continue;
    }

    for (const [index, specifier] of specifiers.entries()) {
      if (isUnused(specifier.name.text)) {
        mut_ranges.push(
          specifierEraseRange(
            specifier,
            {
              prev: specifiers[index - 1],
              next: specifiers[index + 1],
              hasTrailingComma: specifiers.hasTrailingComma,
            },
            sourceFile,
          ),
        );
      }
    }
  }

  return mut_ranges;
};

/**
 * The range that takes one specifier out of a list and leaves the list
 * well-formed. A specifier's full start is right after the previous comma
 * (or the brace), so it covers the whitespace and line break before it.
 */
const specifierEraseRange = (
  specifier: ts.Node,
  neighbors: Readonly<{
    prev: ts.Node | undefined;
    next: ts.Node | undefined;
    hasTrailingComma: boolean;
  }>,
  sourceFile: DeepReadonly<ts.SourceFile>,
): EraseRange => {
  if (neighbors.next !== undefined) {
    // `{ a, X, b }` -> `{ a, b }`: up to the full start of the next one,
    // which is right after this one's comma.
    return [specifier.getFullStart(), neighbors.next.getFullStart()];
  }

  if (neighbors.hasTrailingComma) {
    // `{ a, X, }` -> `{ a, }`: this one and its comma.
    return [
      specifier.getFullStart(),
      sourceFile.text.indexOf(',', specifier.getEnd()) + 1,
    ];
  }

  if (neighbors.prev !== undefined) {
    // `{ a, X }` -> `{ a }`: the comma that precedes and this one.
    return [neighbors.prev.getEnd(), specifier.getEnd()];
  }

  // The only specifier: the caller erases the whole declaration instead.
  return [specifier.getStart(sourceFile), specifier.getEnd()];
};

/**
 * Names of every identifier that reads as a reference: everything except
 * import bindings themselves and property names.
 */
const collectReferencedNames = (
  sourceFile: DeepReadonly<ts.SourceFile>,
  isErased: IsErased,
): ReadonlySet<string> => {
  const mut_names = new Set<string>();

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      return;
    }

    if (isErased(node.getStart(sourceFile))) {
      return;
    }

    if (ts.isIdentifier(node) && !isPropertyName(node)) {
      mut_names.add(node.text);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return mut_names;
};

const isPropertyName = (node: ts.Node): boolean => {
  const { parent } = node;

  return (
    (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
    (ts.isPropertyAssignment(parent) && parent.name === node) ||
    (ts.isMethodDeclaration(parent) && parent.name === node) ||
    (ts.isPropertyDeclaration(parent) && parent.name === node) ||
    (ts.isBindingElement(parent) && parent.propertyName === node)
  );
};

/**
 * Deletes every character in the ranges except line breaks.
 *
 * Positions are UTF-16 code units, as in the AST, so the text is split into
 * code units rather than code points.
 */
const eraseRanges = (source: string, ranges: readonly EraseRange[]): string => {
  if (Arr.isEmpty(ranges)) {
    return source;
  }

  const mut_erased: boolean[] = Array.from(
    { length: source.length },
    () => false,
  );

  for (const [start, end] of ranges) {
    mut_erased.fill(true, start, end);
  }

  return source
    .split('')
    .filter(
      (char, i) => mut_erased[i] !== true || char === '\n' || char === '\r',
    )
    .join('');
};
