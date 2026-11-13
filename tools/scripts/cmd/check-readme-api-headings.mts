import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';
import { codeSpans, markdownLines } from '../lib/markdown.mjs';
import { plural } from '../lib/plural.mjs';
import { listLibraryDirs, PACKAGE_ENTRY_FILES } from '../lib/repo-files.mjs';
import { skipExpressionWrappers } from '../lib/ts-expression-wrappers.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a `libs/*` README heading that gives a function's signature (``###
 * `f(a, b?): R` ``) differs from the declaration it names.
 *
 * A signature heading is one whose first code span is a call (`isSignature`).
 * It is read as `declare function <span>;` and compared with the function the
 * package's entry point (`src/entry-point.mts`, else `src/index.mts`) exports
 * under that name — the source rather than the built `.d.mts`, so that the
 * check needs no build; `tsc` writes the annotations into the `.d.mts` as they
 * are written.
 *
 * A heading may leave things out, and what it leaves out is not compared: it
 * must give every parameter, by name (any name stands for a destructured one),
 * with `?` where a caller may leave it out (it is optional, or has a default
 * that no required parameter follows) and `...` where it is a rest parameter. A
 * `this` parameter is not one a caller passes: a heading may leave it out, and
 * one it gives must be declared. Type parameters, parameter types and the
 * return type are compared only where the heading gives them, as printed by
 * TypeScript, and must then be what the declaration writes. A heading cannot
 * give a type the check reads none of: one that is inferred, one read from a
 * type rather than a signature (`export const f = make()`), or that of a
 * required parameter with a default, which `tsc` widens with `| undefined`.
 * With overloads, the heading has to match one of the overload signatures,
 * which is what a caller sees, never the implementation's.
 */
export const checkReadmeApiHeadings = async (): Promise<
  Result<Readonly<{ readmes: number; headings: number }>, string>
> => {
  const packageDirsResult = await listLibraryDirs();

  if (Result.isErr(packageDirsResult)) {
    return Result.err(`❌ ${packageDirsResult.value}`);
  }

  const readEntries = await Promise.all(
    packageDirsResult.value.map(async (packageDir) => ({
      packageDir,
      readme: await readReadme(path.join(packageDir, 'README.md')),
    })),
  );

  const unreadable = Arr.generate(function* () {
    for (const { readme } of readEntries) {
      if (Result.isErr(readme)) {
        yield readme.value;
      }
    }
  });

  if (Arr.isNonEmpty(unreadable)) {
    return Result.err(`❌ ${unreadable.join('\n')}`);
  }

  const readmes = Arr.generate(function* () {
    for (const { packageDir, readme } of readEntries) {
      if (Result.isOk(readme) && readme.value !== undefined) {
        yield { packageDir, readme: readme.value };
      }
    }
  });

  const reports = readmes.map(({ packageDir, readme }) => ({
    packageDir,
    readmePath: path.relative(
      projectRootPath,
      path.join(packageDir, 'README.md'),
    ),
    headings: signatureHeadings(readme),
  }));

  const failures = reports.flatMap(({ readmePath, packageDir, headings }) =>
    mismatchesOf(packageDir, headings).map((mismatch) => ({
      readmePath,
      ...mismatch,
    })),
  );

  if (Arr.isNonEmpty(failures)) {
    return Result.err(
      [
        `❌ ${plural(failures.length, 'README API heading')} ${failures.length === 1 ? 'differs from the declaration it names' : 'differ from the declarations they name'}:`,
        '',
        ...failures.flatMap(
          ({ readmePath, line, heading, problem, declared }) => [
            `  ${readmePath}:${line}: \`${heading}\` ${problem}`,
            `    heading:     ${heading}`,
            ...declared.map((signature) => `    declaration: ${signature}`),
            '',
          ],
        ),
        'Make the heading say what the declaration says, or leave out the',
        'types it cannot carry: a heading may give only the name and the',
        'parameters (with `?` and `...` as declared). The check reads the',
        "package's own modules alone, so a function re-exported from another",
        'package, from a module that does not resolve or by re-exports that go',
        'round in a circle cannot be named by a signature heading.',
      ].join('\n'),
    );
  }

  return Result.ok({
    readmes: reports.filter(({ headings }) => Arr.isNonEmpty(headings)).length,
    headings: reports.reduce((sum, { headings }) => sum + headings.length, 0),
  });
};

/**
 * The headings of a README that give a signature: the first code span of each
 * heading outside a fence, where that span is a call (`isSignature`). A
 * member's heading (`Observable.subscribe(…)`) is not one, and a bare name is
 * compared with the top-level export of that name, whatever section it is in.
 */
export const signatureHeadings = (
  readme: string,
): readonly SignatureHeading[] =>
  Arr.generate<SignatureHeading>(function* () {
    for (const { line, text, fenced } of markdownLines(readme)) {
      if (fenced || !HEADING.test(text)) {
        continue;
      }

      const [first] = codeSpans(text);

      if (first !== undefined && isSignature(first.trim())) {
        yield { line, signature: first.trim() };
      }
    }
  });

/**
 * Each signature heading of `readme` that differs from the declaration it names
 * in the package at `packageDir`, with both texts.
 */
export const findHeadingMismatches = (
  packageDir: string,
  readme: string,
): readonly Mismatch[] => mismatchesOf(packageDir, signatureHeadings(readme));

/**
 * A README's text, or `undefined` for a package that has none; any other
 * failure to read one is an error, not a README with no headings.
 */
export const readReadme = async (
  filePath: string,
): Promise<Result<string | undefined, string>> => {
  const result = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(filePath, 'utf8'),
  );

  if (Result.isOk(result)) {
    return result;
  }

  return isRecord(result.value) && result.value['code'] === 'ENOENT'
    ? Result.ok(undefined)
    : Result.err(
        `Could not read ${filePath}: ${unknownToString(result.value)}`,
      );
};

export type SignatureHeading = Readonly<{
  /** 1-based. */
  line: number;
  /** The code span, as written. */
  signature: string;
}>;

export type Mismatch = Readonly<{
  /** 1-based line of the heading in the README. */
  line: number;
  heading: string;
  /** Why the heading differs, after the heading in the report. */
  problem: string;
  /** Each signature of the declaration, as a heading would give it. */
  declared: readonly string[];
}>;

/** What a mismatch says of a type the check reads none of, and why. */
const UNREAD_TYPE =
  'gives none the check reads (it is inferred, read from a type, or that of a default before a required parameter)';

/** As {@link UNREAD_TYPE}, of type parameters or a return type. */
const UNREAD =
  'gives none the check reads (it is inferred, or read from a type)';

const HEADING = /^ {0,3}#{1,6}\s/u;

const CALL_START =
  /^[\p{L}\p{Nl}_$][\p{L}\p{Nl}\p{Mn}\p{Mc}\p{Nd}\p{Pc}$\u{200C}\u{200D}]*(?<open>[(<])/u;

// The checker resolves exports and call signatures and judges optionality; it
// never prints a type, so the packages' own lib, types and strictness, which
// would change what an inferred type prints as, are not needed.
const COMPILER_OPTIONS: ts.CompilerOptions = {
  noEmit: true,
  // Without it, a module written in `.tsx` does not resolve.
  jsx: ts.JsxEmit.Preserve,
  strict: true,
  lib: ['lib.esnext.d.ts'],
  types: [],
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  target: ts.ScriptTarget.ESNext,
  skipLibCheck: true,
} as const;

/**
 * A host that resolves only relative imports: the package's own modules. What
 * another package declares resolves only once that package is built, which
 * `check:prose` runs without, so reading it would pass a heading locally that
 * CI fails.
 */
const COMPILER_HOST: ts.CompilerHost = {
  ...ts.createCompilerHost(COMPILER_OPTIONS),
  resolveModuleNameLiterals: (
    literals,
    containingFile,
    redirectedReference,
    options,
    containingSourceFile,
  ) =>
    literals.map((literal) =>
      literal.text.startsWith('.')
        ? ts.resolveModuleName(
            literal.text,
            containingFile,
            options,
            ts.sys,
            undefined,
            redirectedReference,
            ts.getModeForUsageLocation(containingSourceFile, literal, options),
          )
        : { resolvedModule: undefined },
    ),
} as const;

type Consumer = Readonly<{
  fileName: string;
  text: string;
}>;

const CONSUMER_FILE_NAME = '__check-readme-api-headings__.mts';

/**
 * "'f' cannot be used as a value because it was imported using 'import type'"
 * and "… exported using 'export type'".
 */
const TYPE_ONLY_CODES: ReadonlySet<number> = new Set<number>([1361, 1362]);

const printer = ts.createPrinter({ removeComments: true });

/**
 * A signature reduced to what is compared. A heading's leaves `undefined`
 * whatever it does not give; a declaration's leaves `undefined` whatever it
 * does not write, which a heading then cannot give either.
 */
type Shape = Readonly<{
  /** `''` for none. */
  typeParameters: string | undefined;
  thisParameter: ParameterShape | undefined;
  parameters: readonly ParameterShape[];
  returnType: string | undefined;
}>;

type ParameterShape = Readonly<{
  name: string;
  /** `false` for a destructured parameter, whose name a heading chooses. */
  named: boolean;
  optional: boolean;
  rest: boolean;
  type: string | undefined;
}>;

type Problem = Readonly<
  | { kind: 'not-exported'; declared: readonly [] }
  | { kind: 'differs'; text: string; declared: readonly string[] }
>;

/** The first syntax error TypeScript reports in `text`, if any. */
const firstSyntaxError = (text: string): string | undefined => {
  const { diagnostics = [] } = ts.transpileModule(text, {
    reportDiagnostics: true,
  });

  const [diagnostic] = diagnostics;

  return diagnostic === undefined
    ? undefined
    : ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ');
};

/**
 * Whether a code span is a call: a name, then `(`, or then `<` and somewhere a
 * `(`, that is not a type (`Fn<(x: number) => void>`). `Result<T, E>`, a
 * member's heading (`Observable.subscribe(…)`) and a generator's (`*range(…)`)
 * are not read. Whatever else starts so is a call, readable or not:
 * `parseHeading` reports the one TypeScript cannot read.
 */
const isSignature = (span: string): boolean => {
  const start = CALL_START.exec(span)?.groups?.['open'];

  return (
    start === '(' ||
    (start === '<' &&
      span.includes('(') &&
      firstSyntaxError(`type T = ${span};`) !== undefined)
  );
};

const isThisParameter = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.ParameterDeclaration has no readonly form; read only.
  parameter: ts.ParameterDeclaration,
): boolean => ts.isIdentifier(parameter.name) && parameter.name.text === 'this';

const print = (node: DeepReadonly<ts.Node>): string =>
  printer
    .printNode(ts.EmitHint.Unspecified, node, node.getSourceFile())
    .replaceAll(/\s+/gu, ' ')
    .trim();

const typeParametersText = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.SignatureDeclaration has no readonly form the checker accepts; read only.
  declaration: ts.SignatureDeclaration,
): string =>
  declaration.typeParameters === undefined ||
  declaration.typeParameters.length === 0
    ? ''
    : (`<${declaration.typeParameters.map(print).join(', ')}>` as const);

const skipParenthesizedType = (
  type: DeepReadonly<ts.TypeNode>,
): DeepReadonly<ts.TypeNode> =>
  ts.isParenthesizedTypeNode(type) ? skipParenthesizedType(type.type) : type;

/**
 * A type as compared: printed, on one line, without the parentheses around the
 * whole of it, which `((config: C) => O)` needs in a return position of an
 * arrow function and a heading does not.
 */
const typeText = (type: DeepReadonly<ts.TypeNode>): string =>
  print(skipParenthesizedType(type));

/** A parameter as written: `?` for optional, and no type unless one is. */
const writtenParameter = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.ParameterDeclaration has no readonly form; read only.
  parameter: ts.ParameterDeclaration,
): ParameterShape =>
  ({
    name: print(parameter.name),
    named: ts.isIdentifier(parameter.name),
    optional:
      parameter.questionToken !== undefined ||
      parameter.initializer !== undefined,
    rest: parameter.dotDotDotToken !== undefined,
    type: parameter.type === undefined ? undefined : typeText(parameter.type),
  }) as const;

/** The `this` parameter of a signature, as written, if it has one. */
const thisParameterOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.SignatureDeclaration has no readonly form; read only.
  declaration: ts.SignatureDeclaration,
): ParameterShape | undefined => {
  const parameter = declaration.parameters.find(isThisParameter);

  return parameter === undefined ? undefined : writtenParameter(parameter);
};

// Called more than once for a heading, which is cheap: a heading is one line.
const parseHeading = (
  signature: string,
): Result<Readonly<{ name: string; shape: Shape }>, string> => {
  const text = `declare function ${signature};` as const;

  const error = firstSyntaxError(text);

  if (error !== undefined) {
    return Result.err(`is not a signature TypeScript can read: ${error}`);
  }

  const sourceFile = ts.createSourceFile(
    'heading.mts',
    text,
    ts.ScriptTarget.ESNext,
    true,
  );

  const [statement, ...rest] = sourceFile.statements;

  return statement !== undefined &&
    Arr.isEmpty(rest) &&
    ts.isFunctionDeclaration(statement) &&
    statement.name !== undefined &&
    statement.body === undefined
    ? Result.ok({
        name: statement.name.text,
        shape: {
          typeParameters:
            statement.typeParameters === undefined
              ? undefined
              : typeParametersText(statement),
          thisParameter: thisParameterOf(statement),
          parameters: statement.parameters
            .filter((parameter) => !isThisParameter(parameter))
            .map(writtenParameter),
          returnType:
            statement.type === undefined ? undefined : typeText(statement.type),
        },
      })
    : Result.err('is not a signature TypeScript can read as one function');
};

const compareParameters = (
  index: number,
  heading: ParameterShape,
  declared: ParameterShape | undefined,
): string | undefined => {
  if (declared === undefined) {
    return `has no parameter ${index + 1} in the declaration`;
  }

  const { name } = heading;

  if (declared.named && name !== declared.name) {
    return `parameter ${index + 1} is \`${name}\`, the declaration names it \`${declared.name}\``;
  }

  if (declared.rest !== heading.rest) {
    return declared.rest
      ? `parameter \`${name}\` is a rest parameter in the declaration, not in the heading`
      : `parameter \`${name}\` is a rest parameter in the heading, not in the declaration`;
  }

  if (declared.optional !== heading.optional) {
    return declared.optional
      ? `parameter \`${name}\` is optional in the declaration, not in the heading`
      : `parameter \`${name}\` is optional in the heading, not in the declaration`;
  }

  return heading.type !== undefined && heading.type !== declared.type
    ? `parameter \`${name}\` has type \`${heading.type}\`, the declaration ${declared.type === undefined ? UNREAD_TYPE : `\`${declared.type}\``}`
    : undefined;
};

/** Why `heading` differs from `declared`, or `undefined` when it does not. */
const compareShapes = (heading: Shape, declared: Shape): string | undefined => {
  if (
    heading.typeParameters !== undefined &&
    heading.typeParameters !== declared.typeParameters
  ) {
    return `has type parameters \`${heading.typeParameters}\`, the declaration ${declared.typeParameters === undefined ? UNREAD : declared.typeParameters === '' ? 'none' : `\`${declared.typeParameters}\``}`;
  }

  if (heading.thisParameter !== undefined) {
    const problem =
      declared.thisParameter === undefined
        ? 'has a `this` parameter, the declaration none'
        : compareParameters(0, heading.thisParameter, declared.thisParameter);

    if (problem !== undefined) {
      return problem;
    }
  }

  if (heading.parameters.length !== declared.parameters.length) {
    return `has ${plural(heading.parameters.length, 'parameter')}, the declaration ${declared.parameters.length}`;
  }

  for (const [index, parameter] of heading.parameters.entries()) {
    const problem = compareParameters(
      index,
      parameter,
      declared.parameters[index],
    );

    if (problem !== undefined) {
      return problem;
    }
  }

  if (
    heading.returnType !== undefined &&
    heading.returnType !== declared.returnType
  ) {
    return `returns \`${heading.returnType}\`, the declaration ${declared.returnType === undefined ? UNREAD : `\`${declared.returnType}\``}`;
  }

  return undefined;
};

/** A signature as a heading would give it in full. */
const shapeText = (name: string, shape: Shape): string => {
  const parameters = [
    ...(shape.thisParameter === undefined ? [] : [shape.thisParameter]),
    ...shape.parameters,
  ].map((parameter) =>
    [
      parameter.rest ? '...' : '',
      parameter.name,
      parameter.optional ? '?' : '',
      parameter.type === undefined ? '' : `: ${parameter.type}`,
    ].join(''),
  );

  const returnType =
    shape.returnType === undefined ? '' : (`: ${shape.returnType}` as const);

  return `${name}${shape.typeParameters ?? ''}(${parameters.join(', ')})${returnType}`;
};

const compareHeading = (
  signature: string,
  shapesOf: (
    exportName: string,
  ) => readonly Shape[] | 'unreadable' | 'type-only' | undefined,
): Problem | undefined => {
  const parsed = parseHeading(signature);

  if (Result.isErr(parsed)) {
    return { kind: 'differs', text: parsed.value, declared: [] };
  }

  const { name, shape: heading } = parsed.value;

  const shapes = shapesOf(name);

  if (shapes === undefined) {
    return { kind: 'not-exported', declared: [] };
  }

  if (shapes === 'type-only') {
    return {
      kind: 'differs',
      text: 'names an export that is type-only (`export type` or `import type` on its way), which a caller cannot call: export the value, or give the heading no signature',
      declared: [],
    };
  }

  if (shapes === 'unreadable') {
    return {
      kind: 'differs',
      text: 'names an export whose type the check cannot read (it comes from another package, from a module that does not resolve or from re-exports that go round in a circle, or it is `any`): give the export a written signature in this package, or the heading no signature',
      declared: [],
    };
  }

  if (!Arr.isNonEmpty(shapes)) {
    return {
      kind: 'differs',
      text: 'names an export that is not declared as a function',
      declared: [],
    };
  }

  const problems = shapes.map((declared) => compareShapes(heading, declared));

  if (problems.includes(undefined)) {
    return undefined;
  }

  return {
    kind: 'differs',
    text:
      shapes.length === 1
        ? (problems[0] ?? '')
        : `matches none of the ${shapes.length} overloads: ${problems.join('; ')}`,
    declared: shapes.map((shape) => shapeText(name, shape)),
  };
};

/**
 * A signature as written, each type as its annotation prints. A type that is
 * not written is left `undefined`: what `tsc` infers for it, and so writes into
 * the `.d.mts`, depends on the package's compiler options and on whether the
 * packages it imports are built, which `check:prose` runs without.
 */
const writtenShape = (
  checker: DeepReadonly<ts.TypeChecker>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.SignatureDeclaration has no readonly form the checker accepts; read only.
  declaration: ts.SignatureDeclaration,
): Shape =>
  ({
    typeParameters: typeParametersText(declaration),
    thisParameter: thisParameterOf(declaration),
    parameters: declaration.parameters
      .filter((parameter) => !isThisParameter(parameter))
      .map((parameter) => {
        // A default makes a parameter optional only where no required one
        // follows it, which the checker knows.
        const optional = checker.isOptionalParameter(parameter);

        const written = writtenParameter(parameter);

        return {
          ...written,
          optional,
          // A required parameter with a default also takes `undefined`, which
          // `tsc` adds to its type in the `.d.mts`; that type is not written.
          type:
            !optional && parameter.initializer !== undefined
              ? undefined
              : written.type,
        };
      }),
    returnType:
      declaration.type === undefined ? undefined : typeText(declaration.type),
  }) as const;

/**
 * A call signature of a type, which writes nothing: only its parameters' names,
 * optionality and rest are compared, and a heading for it gives no types. The
 * parameters are those the signature declares: a rest tuple (`...a: A`) is one
 * rest parameter, not the parameters it stands for.
 */
const typeShape = (
  checker: DeepReadonly<ts.TypeChecker>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.Signature has no readonly form the checker accepts; read only.
  signature: ts.Signature,
): Shape =>
  ({
    typeParameters: undefined,
    thisParameter:
      signature.thisParameter === undefined
        ? undefined
        : ({
            name: 'this',
            named: true,
            optional: false,
            rest: false,
            type: undefined,
          } as const),
    parameters: signature.parameters.map((parameter) => {
      const declaration = parameter.valueDeclaration;

      const isParameter =
        declaration !== undefined && ts.isParameter(declaration);

      return {
        name: isParameter ? print(declaration.name) : parameter.name,
        named: !isParameter || ts.isIdentifier(declaration.name),
        optional: isParameter && checker.isOptionalParameter(declaration),
        rest: isParameter && declaration.dotDotDotToken !== undefined,
        type: undefined,
      };
    }),
    returnType: undefined,
  }) as const;

/**
 * The call signatures of a type, or `'unreadable'` for `any`: what the type of
 * something from another package is, since the program does not read other
 * packages (`COMPILER_HOST`), and what a heading cannot be compared with either.
 */
const typeShapes = (
  checker: DeepReadonly<ts.TypeChecker>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.Type has no readonly form the checker accepts; read only.
  type: ts.Type,
): readonly Shape[] | 'unreadable' =>
  (type.flags & ts.TypeFlags.Any) === 0
    ? type.getCallSignatures().map((signature) => typeShape(checker, signature))
    : 'unreadable';

/**
 * What a caller sees of `symbol`: the overload signatures of a function that
 * has them, else the function itself or the function a `const` holds, as
 * written; and for a `const` that holds what a call returned
 * (`createResultAssert(…)`), the call signatures of its type. Empty when it is
 * not a function; `'unreadable'` when its type is `any` (`typeShapes`) or it
 * has no declaration: re-exported from another package, which the program does
 * not read (`COMPILER_HOST`), from a module that does not resolve, or by
 * re-exports that go round in a circle.
 */
const declaredShapes = (
  checker: DeepReadonly<ts.TypeChecker>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.Symbol has no readonly form the checker accepts; read only.
  symbol: ts.Symbol,
): readonly Shape[] | 'unreadable' => {
  const declarations = symbol.declarations ?? [];

  // A re-export that resolves to nothing the program reads.
  if (!Arr.isNonEmpty(declarations)) {
    return 'unreadable';
  }

  if ((symbol.flags & ts.SymbolFlags.Value) === 0) {
    return [];
  }

  const functions = declarations.filter(ts.isFunctionDeclaration);

  const overloads = functions.filter(({ body }) => body === undefined);

  if (Arr.isNonEmpty(overloads)) {
    return overloads.map((declaration) => writtenShape(checker, declaration));
  }

  if (Arr.isNonEmpty(functions)) {
    return functions.map((declaration) => writtenShape(checker, declaration));
  }

  const [variable] = declarations.filter(ts.isVariableDeclaration);

  // Anything else that holds a function (`export const { run } = make();`) is
  // read from its type, which gives no types to compare.
  if (variable === undefined) {
    return typeShapes(checker, checker.getTypeOfSymbol(symbol));
  }

  // A written function type is what callers see.
  const annotation =
    variable.type === undefined
      ? undefined
      : skipParenthesizedType(variable.type);

  if (annotation !== undefined && ts.isFunctionTypeNode(annotation)) {
    return [writtenShape(checker, annotation)];
  }

  const type = checker.getTypeOfSymbolAtLocation(symbol, variable);

  const initializer =
    variable.initializer === undefined || variable.type !== undefined
      ? undefined
      : skipExpressionWrappers(variable.initializer);

  // The function inside the wrappers is what callers see only where they left
  // its type as it is (parentheses, `satisfies`, `!`); `as` or `<T>` replaces
  // it, and then only the checker reads it, even where it names a function
  // type. The checker gives a wrapper that keeps the type the very type object
  // of what it wraps, so the two are compared as objects.
  if (
    initializer !== undefined &&
    (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)) &&
    checker.getTypeAtLocation(initializer) === type
  ) {
    return [writtenShape(checker, initializer)];
  }

  return typeShapes(checker, type);
};

const withSlashes = (fileName: string): string =>
  fileName.replaceAll('\\', '/');

/**
 * A module beside the entry that uses each name a heading gives as a value, one
 * line each, so that TypeScript says which of them a caller cannot call: one
 * exported or imported as a type only, by whatever route (`export type`,
 * `import type`, `export type *`).
 */
const consumerOf = (
  entryPoint: string,
  headings: readonly SignatureHeading[],
): Consumer => {
  const names = Arr.uniq(
    Arr.generate(function* () {
      for (const { signature } of headings) {
        const parsed = parseHeading(signature);

        if (Result.isOk(parsed)) {
          yield parsed.value.name;
        }
      }
    }),
  );

  const specifier =
    `./${path.basename(entryPoint).replace(/\.mts$/u, '.mjs')}` as const;

  return {
    // As TypeScript names the files it asks its host for, on Windows too.
    fileName: withSlashes(
      path.join(path.dirname(entryPoint), CONSUMER_FILE_NAME),
    ),
    text: Arr.toUnshifted(
      `import { ${names.join(', ')} } from '${specifier}';`,
    )(names.map((name) => `void ${name};`)).join('\n'),
  };
};

/** The program's host, serving `consumer` beside the package's own files. */
const hostWith = (consumer: Consumer): ts.CompilerHost =>
  ({
    ...COMPILER_HOST,
    getSourceFile: (fileName, languageVersion, ...rest) =>
      withSlashes(fileName) === consumer.fileName
        ? ts.createSourceFile(fileName, consumer.text, languageVersion, true)
        : COMPILER_HOST.getSourceFile(fileName, languageVersion, ...rest),
  }) as const;

/** The names TypeScript reports, in `consumer`, as usable as types only. */
const typeOnlyNames = (
  program: ts.Program,
  consumer: Consumer,
): ReadonlySet<string> => {
  const sourceFile = program.getSourceFile(consumer.fileName);

  // A root file the host serves: missing, it would pass every type-only export.
  if (sourceFile === undefined) {
    throw new Error(`The program has no ${consumer.fileName}.`);
  }

  return new Set(
    Arr.generate(function* () {
      for (const { code, start, length } of program.getSemanticDiagnostics(
        sourceFile,
      )) {
        if (
          start !== undefined &&
          length !== undefined &&
          TYPE_ONLY_CODES.has(code)
        ) {
          yield sourceFile.text.slice(start, start + length);
        }
      }
    }),
  );
};

const mismatchesOf = (
  packageDir: string,
  headings: readonly SignatureHeading[],
): readonly Mismatch[] => {
  if (!Arr.isNonEmpty(headings)) {
    return [];
  }

  // The root entry alone: no README heading names a subpath export (such as
  // `ts-data-forge/array`) today, and one that did would fail as naming nothing
  // this entry exports rather than pass unchecked.
  const entryPoint = PACKAGE_ENTRY_FILES.map((entry) =>
    path.join(packageDir, entry),
  ).find((file) => ts.sys.fileExists(file));

  if (entryPoint === undefined) {
    return headings.map(({ line, signature }) => ({
      line,
      heading: signature,
      problem: `has no declaration to be read: the package has neither ${PACKAGE_ENTRY_FILES.join(' nor ')}`,
      declared: [],
    }));
  }

  // A program for each package that has signature headings, none shared: a
  // program over one package's sources costs little, and few packages have such
  // headings.
  const consumer = consumerOf(entryPoint, headings);

  const program = ts.createProgram(
    [entryPoint, consumer.fileName],
    COMPILER_OPTIONS,
    hostWith(consumer),
  );

  const checker = program.getTypeChecker();

  const entrySourceFile = program.getSourceFile(entryPoint);

  const moduleSymbol =
    entrySourceFile === undefined
      ? undefined
      : checker.getSymbolAtLocation(entrySourceFile);

  const exportsByName = new Map(
    (moduleSymbol === undefined
      ? []
      : checker.getExportsOfModule(moduleSymbol)
    ).map((symbol) => [symbol.name, symbol] as const),
  );

  const entryName = path.relative(packageDir, entryPoint).replaceAll('\\', '/');

  const typeOnly = typeOnlyNames(program, consumer);

  return Arr.generate<Mismatch>(function* () {
    for (const { line, signature } of headings) {
      const problem = compareHeading(signature, (name) => {
        const symbol = exportsByName.get(name);

        if (symbol === undefined) {
          return undefined;
        }

        if (typeOnly.has(name)) {
          return 'type-only';
        }

        return declaredShapes(
          checker,
          (symbol.flags & ts.SymbolFlags.Alias) === 0
            ? symbol
            : checker.getAliasedSymbol(symbol),
        );
      });

      if (problem !== undefined) {
        yield {
          line,
          heading: signature,
          problem:
            problem.kind === 'not-exported'
              ? `names nothing ${entryName} exports`
              : problem.text,
          declared: problem.declared,
        };
      }
    }
  });
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkReadmeApiHeadings().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${plural(result.value.headings, 'signature heading')} in ${plural(result.value.readmes, 'README')}: each matches the declaration it names.`,
  );
}
