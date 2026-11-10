import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  isRecord,
  isString,
  memoizeFunction,
  Obj,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import type { DeepReadonly, NonEmptyTuple } from 'ts-type-forge';
import * as ts from 'typescript';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a declaration that a package's entry points export names a type
 * that none of them exports, the class api-extractor reports as
 * `ae-forgotten-export`. Such a type is in the built `.d.mts`, so `tsc` emits
 * it, and a consumer sees its name in hovers and in the declaration, but cannot
 * import it (TS2305; the `exports` map blocks the deep path): a wrapper that has
 * to spell the parameter or return type has no way to.
 *
 * It reads the built declarations, which say what a consumer gets. Every
 * `types` path of the package's `exports` is an entry point, but one under an
 * `internal` subpath (`./internal`, `./internal/dom`), which semantic
 * versioning does not cover. A symbol any entry point exports, a namespace's
 * members included and what an `export =` stands for, is exported, and so is a
 * declaration of the package that a consumer reaches elsewhere: a global (a
 * `global` block, a declaration file that is not a module,
 * `export as namespace`), a member a `declare module 'x'` adds to a module
 * outside the package or declares in a file that is not a module, and what an
 * `export =` of either stands for. In the declarations of each exported symbol,
 * every type reference, `import(…)` type and heritage clause is resolved, and
 * one whose declarations are all inside the package and that is not exported is
 * reported, by its declared name. A type parameter, and a type from another
 * package or the standard library, is not. A heritage clause that names a value
 * (the `X_base` constant `tsc` writes for `class X extends mixin(…)`) is read
 * through the value's type.
 *
 * A type kept unexported on purpose, a helper no consumer has need to spell,
 * says so beside its declaration: one whose doc comment, or that of a namespace
 * holding it, has an `@internal` tag followed by the reason passes.
 * A tag with no reason does not. `tsc` keeps doc comments in the declarations
 * it emits, so the tag written in the source is the one read.
 *
 * Only what an exported declaration names is read: a type named inside an
 * unexported one is reached once that one is exported, and not while it is
 * tagged `@internal`, since a consumer has no need to spell either.
 *
 * Two kinds of reference only compute a type, and are not read: one in the
 * `A extends B` of a conditional type and one in the `as` clause of a mapped
 * type, which decide a branch or a key and are never the type of a value, so a
 * consumer has no need to spell them. Nor is a `typeof x` query, which names a
 * value, not a type: an exported type built on it (`(typeof names)[number]`) is
 * what a consumer spells.
 *
 * The packages read are every published one under `libs/` whose `exports` name
 * a `types` file (a command-line tool's name none), and the private ones of
 * `PRIVATE_PACKAGES_READ`, built: it needs the `dist/` of each, so CI runs it
 * after `ws:build`, beside `ws:check:dist`, not in `check:root`, whose
 * `ws:build:deps` leaves out a package no other one links. What a package of
 * `PENDING_PACKAGES` reports is printed and does not fail.
 */
export const checkForgottenExports = async (): Promise<
  Result<number, string>
> => {
  const packages = await getWorkspacePackages(projectRootPath);

  const { enrolled, stale } = packagesRead(packages, projectRootPath, {
    privateRead: PRIVATE_PACKAGES_READ,
    pending: PENDING_PACKAGES,
  });

  if (Arr.isNonEmpty(stale)) {
    return Result.err(
      `PRIVATE_PACKAGES_READ or PENDING_PACKAGES names ${stale.join(', ')}, which is not what the list holds: for PRIVATE_PACKAGES_READ a private package with a types file, for PENDING_PACKAGES a package read (published under libs/ with a types file, or private and in PRIVATE_PACKAGES_READ).`,
    );
  }

  // One host for every package: each program then parses the standard library
  // and a sibling's declarations once, not once per package.
  const host = cachingHost();

  const reports = await Promise.all(
    enrolled.map(async (pkg): Promise<PackageReport> => {
      const absent = await asyncFilter(pkg.entryPoints, async (file) =>
        fs
          .access(file)
          .then(() => false)
          .catch(() => true),
      );

      if (Arr.isNonEmpty(absent)) {
        return {
          failure: `${pkg.name}: ${absent.map((file) => path.relative(projectRootPath, file)).join(', ')} not built; run \`pnpm run ws:build\`.`,
        };
      }

      const findings = findForgottenExports(pkg.entryPoints, pkg.path, host);

      // Each finding is a type of its own, but one name declared in several
      // namespaces of a file (`RuleEntry`) is one line.
      const lines = Arr.uniq(
        findings.map(
          ({ file, declaration, type, typeFile, bareInternalTag }) =>
            `  ${path.relative(projectRootPath, file)}: ${declaration} names ${type}${typeFile === file ? '' : `, declared in ${path.relative(projectRootPath, typeFile)}`}, which no entry point exports${bareInternalTag ? ' and whose `@internal` tag gives no reason' : ''}.`,
        ),
      );

      if (PENDING_PACKAGES.has(pkg.name)) {
        return Arr.isNonEmpty(lines)
          ? { pending: [`${pkg.name} (pending):`, ...lines].join('\n') }
          : {
              failure: `${pkg.name}: PENDING_PACKAGES names it, but it reports nothing; if its dist/ is current (\`pnpm run ws:build\`), remove it.`,
            };
      }

      return Arr.isNonEmpty(lines)
        ? { failure: [`${pkg.name}:`, ...lines].join('\n') }
        : {};
    }),
  );

  const pending = reports
    .map((report) => report.pending)
    .filter((report) => report !== undefined);

  if (Arr.isNonEmpty(pending)) {
    console.log(pending.join('\n'));
  }

  const failures = reports
    .map((report) => report.failure)
    .filter((report) => report !== undefined);

  if (Arr.isNonEmpty(failures)) {
    return Result.err(
      [
        ...failures,
        '',
        'Export each type named here from an entry point (`export type { … }` is',
        'enough for a class that stays internal at runtime), stop naming it in',
        'the exported declaration, or, for a helper type no consumer spells, tag',
        'it `@internal` with the reason in its doc comment.',
      ].join('\n'),
    );
  }

  // The pending packages are not counted as clean.
  return Result.ok(enrolled.length - pending.length);
};

/**
 * Every `types` file an `exports` value names, in order, without duplicates: a
 * string ending in `.d.mts`, `.d.cts` or `.d.ts`, and the value of every
 * `types` condition, but under an `internal` subpath (`./internal`,
 * `./dom/internal`). A path with a `*` is a pattern, not a file, and is left
 * out.
 */
export const typesEntryPoints = (exportsField: unknown): readonly string[] =>
  Arr.uniq(
    typesPathsIn(
      isRecord(exportsField)
        ? Obj.filter(exportsField, (_value, key) => !isInternalSubpath(key))
        : exportsField,
      false,
    ),
  ).filter((file) => !file.includes('*'));

/**
 * The packages read, each with its entry points, absolute: a published one
 * under `libs/`, or a private one of `lists.privateRead`, with a `types` file
 * either way. And `stale`, the packages the lists name that are not what the
 * list says: a private package read, for `lists.privateRead`, and a package
 * read, for `lists.pending`.
 */
export const packagesRead = (
  packages: readonly Readonly<{
    name: string;
    path: string;
    packageJson: unknown;
  }>[],
  rootDir: string,
  lists: Readonly<{
    privateRead: ReadonlySet<string>;
    pending: ReadonlySet<string>;
  }>,
): Readonly<{
  enrolled: readonly Readonly<{
    name: string;
    path: string;
    entryPoints: readonly string[];
  }>[];
  stale: readonly string[];
}> => {
  const classified = Arr.generate(function* () {
    for (const pkg of packages) {
      const manifest = isRecord(pkg.packageJson)
        ? pkg.packageJson
        : ({} as const);

      const entryPoints = typesEntryPoints(manifest['exports']).map((entry) =>
        path.resolve(pkg.path, entry),
      );

      const isPrivate = manifest['private'] === true;

      const read =
        Arr.isNonEmpty(entryPoints) &&
        (isPrivate
          ? lists.privateRead.has(pkg.name)
          : path.relative(rootDir, pkg.path).startsWith(`libs${path.sep}`));

      if (read) {
        yield { name: pkg.name, path: pkg.path, entryPoints, isPrivate };
      }
    }
  });

  return {
    enrolled: classified.map(({ name, path: dir, entryPoints }) => ({
      name,
      path: dir,
      entryPoints,
    })),
    stale: [
      ...Array.from(lists.privateRead).filter((name) =>
        classified.every((pkg) => pkg.name !== name || !pkg.isPrivate),
      ),
      ...Array.from(lists.pending).filter((name) =>
        classified.every((pkg) => pkg.name !== name),
      ),
    ],
  };
};

/**
 * What {@link checkForgottenExports} reports for one package: each exported
 * declaration that names a type none of `entryPoints` exports, once per
 * exported symbol, file and type, in the order found. `packageDir` decides
 * what is the package's own: a declaration in a file under it, outside
 * `node_modules`. `host` may be shared by the packages read in one run.
 */
export const findForgottenExports = (
  entryPoints: readonly string[],
  packageDir: string,
  host: ts.CompilerHost = cachingHost(),
): readonly Finding[] => {
  const program = ts.createProgram(entryPoints, COMPILER_OPTIONS, host);

  const checker = program.getTypeChecker();

  const realpathOf = (file: string): string => host.realpath?.(file) ?? file;

  const ownDir = `${realpathOf(packageDir)}${path.sep}` as const;

  const isOwn = (declaration: DeepReadonly<ts.Declaration>): boolean => {
    const { fileName } = declaration.getSourceFile();

    return (
      realpathOf(fileName).startsWith(ownDir) &&
      !fileName.split(/[\\/]/u).includes('node_modules')
    );
  };

  /**
   * The declarations a name stands for: its own, and, for an alias (an import,
   * a re-export, `export * as NS`), those of what it resolves to. A name can be
   * both at once — `export type AsyncData<S, E> = …` beside
   * `export * as AsyncData from './impl/index.mjs'` — so both are kept.
   */
  const declarationsOf = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.Symbol has no readonly form the checker accepts; read only.
    symbol: ts.Symbol,
  ): readonly ts.Declaration[] =>
    [
      ...(symbol.declarations ?? []),

      ...(aliasTargetOf(checker, symbol)?.declarations ?? []),
    ] as const;

  const entryExports = entryPoints.flatMap((entryPoint) => {
    const sourceFile = program.getSourceFile(entryPoint);

    if (sourceFile === undefined) {
      throw new Error(`${entryPoint} could not be read.`);
    }

    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);

    if (moduleSymbol === undefined) {
      return [];
    }

    const assignment = exportAssignmentOf(checker, moduleSymbol);

    // Each export by the name a consumer imports it by: of a module with
    // `export =`, the members of what it stands for (`import { f }`), and that
    // itself, which a consumer names as they like, as the entry point writes it
    // (`export = A`). A class's statics are read with the class.
    return [
      ...(assignment === undefined
        ? []
        : [[assignment.text, assignment.target] as const]),
      ...membersOf(checker, moduleSymbol).map(
        (symbol) => [symbol.name, symbol] as const,
      ),
    ];
  });

  // The package's own declarations a consumer reaches elsewhere, as roots: each
  // at the top of a declaration file that is not a module (`/// <reference
  // path>`) or in a `global` block, a global, a module that
  // `export as namespace` makes one, and each member a `declare module 'x'`
  // adds to or declares in a module that is not the package's own, named under
  // the module (`"x".Member`); of a module with `export =` instead, what it
  // stands for, named as the module, its members under that name.
  const elsewhereRoots = Arr.generate(function* () {
    for (const file of program.getSourceFiles()) {
      if (!isOwn(file)) {
        continue;
      }

      const isScript = !ts.isExternalModule(file);

      for (const statement of file.statements) {
        if (isGlobalBlock(statement)) {
          yield* namedSymbolsIn(checker, bodyOf(statement));
        } else if (
          ts.isModuleDeclaration(statement) &&
          ts.isStringLiteral(statement.name)
        ) {
          // A `global` block inside it declares globals too.
          for (const inner of bodyOf(statement)) {
            if (isGlobalBlock(inner)) {
              yield* namedSymbolsIn(checker, bodyOf(inner));
            }
          }

          const declared = checker.getSymbolAtLocation(statement.name);

          // A module of the package's own is read from its entry points.
          if (
            declared !== undefined &&
            (declared.declarations ?? []).every(
              (d) => !(ts.isSourceFile(d) && isOwn(d)),
            )
          ) {
            const moduleName = JSON.stringify(statement.name.text);

            const assigned = exportAssignmentOf(checker, declared)?.target;

            if (assigned !== undefined) {
              // What `export =` stands for, its members under it.
              yield [moduleName, assigned] as const;
            } else {
              // Of a module the package augments, the members it adds, not the
              // other module's whole API; of one it declares, every member.
              for (const member of checker.getExportsOfModule(declared)) {
                if ((member.declarations ?? []).some(isOwn)) {
                  yield [`${moduleName}.${member.name}`, member] as const;
                }
              }
            }
          }
        } else if (ts.isNamespaceExportDeclaration(statement)) {
          // `export as namespace Lib`: the module is the global `Lib`.
          const moduleSymbol = checker.getSymbolAtLocation(file);

          if (moduleSymbol !== undefined) {
            yield [
              statement.name.text,
              exportAssignmentOf(checker, moduleSymbol)?.target ?? moduleSymbol,
            ] as const;
          }
        } else if (isScript) {
          yield* namedSymbolsIn(checker, [statement]);
        }
      }
    }
  });

  const mut_exported = new Set<ts.Declaration>();

  // What a consumer reaches, each with the name it spells it by: what the entry
  // points export, then the declarations it reaches elsewhere.
  const mut_exportedSymbols: (readonly [string, ts.Symbol])[] = [];

  // Breadth first, a namespace's members a level below it, so that a
  // declaration exported both directly and through a namespace keeps its direct
  // name, whatever the order of the exports. The entry points' exports are read
  // to the end before the roots elsewhere, so that a declaration an entry point
  // exports, at any depth, is named as it exports it.
  const readLevel = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.Symbol has no readonly form the checker accepts; read only.
    level: readonly (readonly [string, ts.Symbol])[],
  ): void => {
    const next = level.flatMap(([name, symbol]) => {
      const declarations = declarationsOf(symbol);

      // What the name stands for, but the imports and re-exports it passes
      // through, each of which has a declaration of its own.
      const targets = declarations.filter((d) => !isAliasDeclaration(d));

      if (
        (Arr.isNonEmpty(targets) ? targets : declarations).every(
          (declaration) => mut_exported.has(declaration),
        )
      ) {
        return [];
      }

      for (const declaration of declarations) {
        mut_exported.add(declaration);
      }

      mut_exportedSymbols.push([name, symbol]);

      // A namespace's members are reached through it (`Arr.Foo`).
      const target = aliasTargetOf(checker, symbol) ?? symbol;

      return (target.flags & NAMESPACE_LIKE) === 0
        ? []
        : membersOf(checker, target).map(
            (member) => [`${name}.${member.name}`, member] as const,
          );
    });

    if (Arr.isNonEmpty(next)) {
      readLevel(next);
    }
  };

  readLevel(entryExports);

  readLevel(elsewhereRoots);

  const mut_findings: Finding[] = [];

  // Once per exported symbol, file and type: by the symbol's place in the list,
  // not its name, which two symbols can share (`export { A as X }` and
  // `export { B as X }` in two entry points).
  const mut_seen = new Set<string>();

  for (const [index, [name, symbol]] of mut_exportedSymbols.entries()) {
    // A module (`export * as NS`) or a namespace is walked through its exports,
    // each of which is in the list, not as a whole: what it keeps to itself
    // (`export {}` in a namespace) is not exported.
    const walked = declarationsOf(symbol).filter(
      (declaration) =>
        isOwn(declaration) &&
        !ts.isSourceFile(declaration) &&
        !ts.isModuleDeclaration(declaration),
    );

    for (const declaration of walked) {
      const mut_bases = new Set<ts.Declaration>();

      const visit = (node: ts.Node): void => {
        const referenced = referencedSymbolOf(checker, node);

        const declarations =
          referenced === undefined ? ([] as const) : declarationsOf(referenced);

        if (
          referenced !== undefined &&
          Arr.isNonEmpty(declarations) &&
          declarations.every(isOwn) &&
          declarations.every((d) => !mut_exported.has(d))
        ) {
          const type = typeOf(checker, referenced);

          // A type is reported unless one of its declarations, or a namespace
          // holding one, gives the reason it is `@internal`, and is not read
          // into either way. A base that is a value alone is read through its
          // type, which is part of the class.
          if (type !== undefined) {
            const key =
              `${declaration.getSourceFile().fileName}\0${index}\0${type.id}` as const;

            if (!mut_seen.has(key)) {
              mut_seen.add(key);

              const tags = type.nodes.flatMap(internalTagsOf);

              if (!tags.some(givesReason)) {
                mut_findings.push({
                  file: declaration.getSourceFile().fileName,
                  declaration: name,
                  type: type.name,
                  typeFile: type.file,
                  bareInternalTag: Arr.isNonEmpty(tags),
                });
              }
            }
          } else if (
            ts.isExpressionWithTypeArguments(node) &&
            isValue(checker, referenced)
          ) {
            for (const base of declarations) {
              if (mut_bases.has(base)) {
                continue;
              }

              mut_bases.add(base);

              visit(base);
            }
          }
        }

        ts.forEachChild(node, (child) => {
          if (!onlyComputes(node, child)) {
            visit(child);
          }
        });
      };

      visit(declaration);
    }
  }

  return mut_findings;
};

/** What one package gives the summary: nothing when it is clean. */
type PackageReport = Readonly<{ failure?: string; pending?: string }>;

/** The private packages read, as if published: they replace published ones. */
const PRIVATE_PACKAGES_READ: ReadonlySet<string> = new Set<string>([
  'synstate-dom-next',
  'synstate-next',
]);

/**
 * Packages whose findings are printed and do not fail yet: each is fixed in a
 * pull request stacked on the one adding this check, which removes it here.
 */
const PENDING_PACKAGES: ReadonlySet<string> = new Set<string>([
  'ts-data-forge',
  'ts-fortress',
  'ts-std-forge',
  'ts-type-forge',
]);

export type Finding = Readonly<{
  /** The declaration file the exported declaration is in. */
  file: string;
  /**
   * The exported declaration's name as a consumer reaches it: as an entry point
   * exports it (`export = A` for what an entry point's `export =` stands for,
   * and its members by their own names), with the namespaces holding it
   * (`Arr.first`), or else as a global (a UMD global's member as `Lib.Opts`),
   * or under the module that declares or augments it
   * (`"outside-lib".Augmented`, and `"outside-lib"` for what its `export =`
   * stands for).
   */
  declaration: string;
  /**
   * The name of the type it names that no entry point exports: for an enum
   * member, the enum's.
   */
  type: string;
  /** The declaration file that type is declared in. */
  typeFile: string;
  /**
   * Whether that type, or a namespace holding it, is tagged `@internal`, but
   * with no reason after the tag, which does not let it pass.
   */
  bareInternalTag: boolean;
}>;

const DECLARATION_FILE = /\.d\.[cm]?ts$/u;

const COMPILER_OPTIONS: ts.CompilerOptions = {
  noEmit: true,
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  target: ts.ScriptTarget.ESNext,
  lib: ['lib.esnext.d.ts', 'lib.dom.d.ts'],
  types: [],
  skipLibCheck: true,
} as const;

const NAMESPACE_LIKE = ts.SymbolFlags.Module | ts.SymbolFlags.Enum;

/** Whether an `exports` key is a subpath with an `internal` segment. */
const isInternalSubpath = (key: string): boolean =>
  key.startsWith('./') && key.split('/').includes('internal');

/**
 * Whether `child` of `parent` only computes a type: the `A extends B` of a
 * conditional type, the `as` clause of a mapped type, or a `typeof` query.
 */
const onlyComputes = (parent: ts.Node, child: ts.Node): boolean =>
  ts.isTypeQueryNode(child) ||
  (ts.isImportTypeNode(child) && child.isTypeOf) ||
  (ts.isConditionalTypeNode(parent) &&
    (child === parent.checkType || child === parent.extendsType)) ||
  (ts.isMappedTypeNode(parent) && child === parent.nameType);

const typesPathsIn = (value: unknown, isTypes: boolean): readonly string[] => {
  if (isString(value)) {
    return isTypes || DECLARATION_FILE.test(value) ? [value] : [];
  }

  if (Arr.isArray(value)) {
    return value.flatMap((item: unknown) => typesPathsIn(item, isTypes));
  }

  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, item]) =>
      typesPathsIn(item, key === 'types'),
    );
  }

  return [];
};

const lastNameOf = (name: ts.Node): ts.Node =>
  ts.isQualifiedName(name)
    ? name.right
    : ts.isPropertyAccessExpression(name)
      ? name.name
      : name;

/**
 * The symbol a type reference, a heritage clause (`extends A<T>`) or an
 * `import(…)` type names, by its last name (`B` of `A.B`), or `undefined` for
 * any other node.
 */
const referencedSymbolOf = (
  checker: DeepReadonly<ts.TypeChecker>,
  node: ts.Node,
): ts.Symbol | undefined => {
  const name = ts.isTypeReferenceNode(node)
    ? node.typeName
    : ts.isExpressionWithTypeArguments(node)
      ? node.expression
      : ts.isImportTypeNode(node)
        ? node.qualifier
        : undefined;

  return name === undefined
    ? undefined
    : checker.getSymbolAtLocation(lastNameOf(name));
};

/** What an alias (an import, a re-export) resolves to; `undefined` for a non-alias. */
const aliasTargetOf = (
  checker: DeepReadonly<ts.TypeChecker>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.Symbol has no readonly form the checker accepts; read only.
  symbol: ts.Symbol,
): ts.Symbol | undefined =>
  (symbol.flags & ts.SymbolFlags.Alias) === 0
    ? undefined
    : checker.getAliasedSymbol(symbol);

/**
 * An entity name (`A`, `NS.C`) as its identifiers joined by `.`, whatever the
 * file puts between them; any other expression as written.
 */
const entityNameText = (node: ts.Node): string =>
  ts.isIdentifier(node)
    ? node.text
    : ts.isPropertyAccessExpression(node)
      ? (`${entityNameText(node.expression)}.${node.name.text}` as const)
      : node.getText();

/**
 * What `export =` makes `moduleSymbol` stand for, if it has one, and the
 * assignment as the declaration file writes it (`export = A`, `export = NS.C`),
 * the name a finding gives it.
 */
const exportAssignmentOf = (
  checker: DeepReadonly<ts.TypeChecker>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.Symbol has no readonly form the checker accepts; read only.
  moduleSymbol: ts.Symbol,
): Readonly<{ target: ts.Symbol; text: string }> | undefined => {
  const assignment = moduleSymbol.exports?.get(
    ts.InternalSymbolName.ExportEquals,
  );

  if (assignment === undefined) {
    return undefined;
  }

  const declaration = assignment.declarations?.find(ts.isExportAssignment);

  return {
    target: aliasTargetOf(checker, assignment) ?? assignment,
    // A declaration file writes an entity name after `export =`.
    text:
      declaration === undefined
        ? 'export ='
        : `export = ${entityNameText(declaration.expression)}`,
  };
};

/**
 * The exports of a module, a namespace or an enum, or of what `export =` makes
 * a module stand for, but a class's statics, which are read with the class (a
 * class merged with a namespace has both).
 */
const membersOf = (
  checker: DeepReadonly<ts.TypeChecker>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.Symbol has no readonly form the checker accepts; read only.
  symbol: ts.Symbol,
): readonly ts.Symbol[] =>
  checker
    .getExportsOfModule(symbol)
    .filter((member) =>
      (member.declarations ?? []).some((d) => !ts.isClassElement(d)),
    );

/** Whether `statement` is a `global { … }` block, at the top or in a module's. */
const isGlobalBlock = (statement: ts.Node): statement is ts.ModuleDeclaration =>
  ts.isModuleDeclaration(statement) &&
  (statement.flags & ts.NodeFlags.GlobalAugmentation) !== 0;

/** The statements of a module declaration's block, none for a nested name. */
const bodyOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- its statements go to namedSymbolsIn, whose checker calls take the mutable ts.Statement; read only.
  block: ts.ModuleDeclaration,
): readonly ts.Statement[] =>
  block.body !== undefined && ts.isModuleBlock(block.body)
    ? block.body.statements
    : ([] as const);

/**
 * The symbol of each declaration among `statements` that has a name, with that
 * name: a variable statement's each.
 */
const namedSymbolsIn = (
  checker: DeepReadonly<ts.TypeChecker>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.Statement has no readonly form getNameOfDeclaration accepts; read only.
  statements: readonly ts.Statement[],
): readonly (readonly [string, ts.Symbol])[] =>
  Arr.generate(function* () {
    for (const statement of statements) {
      const declarations: readonly ts.Declaration[] = ts.isVariableStatement(
        statement,
      )
        ? statement.declarationList.declarations
        : ts.isDeclarationStatement(statement)
          ? ([statement] as const)
          : ([] as const);

      for (const declaration of declarations) {
        const declaredName = ts.getNameOfDeclaration(declaration);

        const symbol =
          declaredName === undefined
            ? undefined
            : checker.getSymbolAtLocation(declaredName);

        if (symbol !== undefined) {
          yield [symbol.name, symbol] as const;
        }
      }
    }
  });

/** Whether `node` declares an alias: an import or a re-export. */
const isAliasDeclaration = (node: ts.Node): boolean =>
  ts.isExportSpecifier(node) ||
  ts.isImportSpecifier(node) ||
  ts.isNamespaceExport(node) ||
  ts.isNamespaceImport(node) ||
  ts.isImportClause(node) ||
  ts.isImportEqualsDeclaration(node) ||
  ts.isExportAssignment(node);

/**
 * The type `symbol` stands for, itself or through an alias: its declared name
 * (`Secret` for `import { Secret as S }`, and for a default export of
 * `interface Secret`), the enum's for an enum member, the file declaring it, an
 * `id` that tells two types of one name apart, and the `nodes` declaring it,
 * each of a merged type but a namespace merged with it (the enum's for a
 * member). `undefined` when it stands for a value only, or for a type
 * parameter.
 */
const typeOf = (
  checker: DeepReadonly<ts.TypeChecker>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.Symbol has no readonly form the checker accepts; read only.
  symbol: ts.Symbol,
):
  | Readonly<{
      name: string;
      file: string;
      id: string;
      nodes: NonEmptyTuple<ts.Node>;
    }>
  | undefined => {
  const type =
    (symbol.flags & ts.SymbolFlags.Type) === 0
      ? aliasTargetOf(checker, symbol)
      : symbol;

  // A namespace merged with the type is not what a type reference names.
  const nodes = (type?.declarations ?? [])
    .filter((d) => !ts.isModuleDeclaration(d))
    .map((d) => (ts.isEnumMember(d) ? d.parent : d));

  if (
    type === undefined ||
    !Arr.isNonEmpty(nodes) ||
    (type.flags & ts.SymbolFlags.Type) === 0 ||
    (type.flags & ts.SymbolFlags.TypeParameter) !== 0
  ) {
    return undefined;
  }

  const declaration = nodes[0];

  const declaredName = ts.getNameOfDeclaration(declaration);

  const file = declaration.getSourceFile().fileName;

  return {
    name:
      declaredName !== undefined && ts.isIdentifier(declaredName)
        ? declaredName.text
        : type.name,
    file,
    id: `${file}:${declaration.pos}`,
    nodes,
  };
};

/**
 * The `@internal` tags in the doc comments of `node` and of each declaration
 * holding it (a namespace).
 */
const internalTagsOf = (node: ts.Node): readonly ts.JSDocTag[] =>
  [
    ...ts.getJSDocTags(node),
    ...(ts.isSourceFile(node.parent) ? [] : internalTagsOf(node.parent)),
  ].filter((tag) => tag.tagName.text === 'internal');

/** Whether a tag has text after it: for `@internal`, the reason. */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.JSDocTag has no readonly form getTextOfJSDocComment accepts; read only.
const givesReason = (tag: ts.JSDocTag): boolean =>
  (ts.getTextOfJSDocComment(tag.comment) ?? '').trim() !== '';

/** Whether `symbol` stands for a value, itself or through an alias. */
const isValue = (
  checker: DeepReadonly<ts.TypeChecker>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ts.Symbol has no readonly form the checker accepts; read only.
  symbol: ts.Symbol,
): boolean =>
  ((symbol.flags | (aliasTargetOf(checker, symbol)?.flags ?? 0)) &
    ts.SymbolFlags.Value) !==
  0;

/**
 * A compiler host that reads each file, and asks the file system each question,
 * once however many programs it serves: they share the compiler options, so a
 * file parses the same for each.
 */
const cachingHost = (): ts.CompilerHost => {
  const host = ts.createCompilerHost(COMPILER_OPTIONS);

  return {
    ...host,
    getSourceFile: memoizeFunction(
      (
        fileName: string,
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- the host's own parameter, passed on; read only.
        languageVersion: ts.ScriptTarget | ts.CreateSourceFileOptions,
        onError?: (message: string) => void,
        shouldCreateNewSourceFile?: boolean,
      ) =>
        host.getSourceFile(
          fileName,
          languageVersion,
          onError,
          shouldCreateNewSourceFile,
        ),
      (fileName) => fileName,
    ),
    fileExists: memoizeFunction(
      (file: string) => host.fileExists(file),
      (file) => file,
    ),
    directoryExists: memoizeFunction(
      (directory: string) => host.directoryExists?.(directory) ?? true,
      (directory) => directory,
    ),
    realpath: memoizeFunction(
      (file: string): string => {
        try {
          return host.realpath?.(file) ?? file;
        } catch {
          return file;
        }
      },
      (file) => file,
    ),
  };
};

const asyncFilter = async <A,>(
  items: readonly A[],
  predicate: (item: A) => Promise<boolean>,
): Promise<readonly A[]> => {
  const keep = await Promise.all(items.map(predicate));

  return items.filter((_, i) => keep[i] === true);
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkForgottenExports().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} package(s) name only types their entry points export.`,
  );
}
