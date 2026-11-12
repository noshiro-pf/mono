import * as fs from 'node:fs';
import * as path from 'node:path';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import ts from 'typescript';

// The TypeScript AST and the RuleTester are the libraries' objects, read and
// patched in place, never values this module could take as readonly.
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * Module parity for the rules of a plugin whose module re-exports another's
 * declarations unchanged: ts-data-forge re-exports `Optional`, `isRecord`, … of
 * ts-std-forge, so `import { isRecord } from 'ts-std-forge'` is the same
 * function as `import { isRecord } from 'ts-data-forge'`, and a rule of either
 * plugin has to treat the two alike — report the same code, and fix it the same
 * way, reusing whichever import the file already has.
 *
 * {@link installModuleParity} makes that a test of every rule, present and
 * future: each `RuleTester#run` of the package also runs, for every case whose
 * imports from `from` name only shared exports, the same case importing them
 * from `to`, and expects the same verdict and the same fix. A rule that reads
 * or writes a shared name only through `from` fails its own tests.
 */

type SuggestionLike = Readonly<{ output: string }>;

type ErrorLike = Readonly<{
  suggestions?: readonly SuggestionLike[] | null;
}>;

type CaseLike = Readonly<{
  code: string;
  name?: string;
  filename?: string;
  output?: string | null | readonly string[];
  errors?: readonly ErrorLike[];
}>;

type RunTestsLike = Readonly<{
  valid: readonly (CaseLike | string)[];
  invalid: readonly CaseLike[];
}>;

export type ModuleParityOptions = Readonly<{
  /** The module the package's tests import from. */
  from: string;

  /** The module that exports `sharedExports` as the same declarations. */
  to: string;

  /** The exports `from` and `to` share ({@link listSharedExports}). */
  sharedExports: readonly string[];
}>;

/**
 * Patches `RuleTester.prototype.run` so that every run also runs the
 * {@link withSwappedCases} of its cases. Called from the package's Vitest
 * `setupFiles`, with the package's own `RuleTester`, so that the class patched
 * is the one its tests construct. It marks the class with
 * `Symbol.for('eslint-rule-module-parity.installed')`, which a test of the
 * package reads (it cannot import this module from `src/`), so that dropping
 * the setup file fails rather than silently running each case once. Installing
 * twice changes nothing.
 */
export const installModuleParity = (
  ruleTesterClass: RuleTesterClassLike,
  options: ModuleParityOptions,
): void => {
  if (isModuleParityInstalled(ruleTesterClass)) {
    return;
  }

  type Run = (
    this: unknown,
    ruleName: string,
    rule: unknown,
    tests: RunTestsLike,
  ) => void;

  // `RuleTesterClassLike` names no parameter types, so that any `RuleTester`
  // fits it; these are the ones `run` is called with.
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  const originalRun = ruleTesterClass.prototype.run as unknown as Run;

  // Patching the library's prototype is the point: every `RuleTester` the
  // package's tests construct has to run the copies, without each test file
  // opting in.
  // eslint-disable-next-line functional/immutable-data
  Object.defineProperties(ruleTesterClass.prototype, {
    run: {
      configurable: true,
      writable: true,
      value(
        this: unknown,
        ruleName: string,
        rule: unknown,
        tests: RunTestsLike,
      ) {
        originalRun.call(
          this,
          ruleName,
          rule,
          withSwappedCases(tests, options),
        );
      },
    },
    [installedMark]: {
      value: true,
    },
  });
};

/** Whether {@link installModuleParity} has patched `ruleTesterClass`. */
export const isModuleParityInstalled = (
  ruleTesterClass: RuleTesterClassLike,
): boolean =>
  isRecord(ruleTesterClass.prototype) &&
  hasKey(ruleTesterClass.prototype, installedMark);

/**
 * `tests` followed by the copy of each case that imports from `from` only
 * shared exports, importing them from `to` instead, its expected outputs
 * rewritten the same way. A case is left without a copy when its code imports
 * nothing from `from`, or when the code or an expected output names `from` in a
 * way that cannot be moved: an export only `from` has, a side-effect or default
 * import, a namespace import used other than as `ns.<shared>`, a
 * re-export, or the module name anywhere else.
 */
export const withSwappedCases = <T extends RunTestsLike>(
  tests: T,
  options: ModuleParityOptions,
): T => {
  const validCopies = Arr.generate(function* () {
    for (const test of tests.valid) {
      const testCase =
        typeof test === 'string' ? ({ code: test } as const) : test;

      const copy = swapCase(testCase, options);

      if (copy !== undefined) {
        yield copy;
      }
    }
  });

  const invalidCopies = Arr.generate(function* () {
    for (const testCase of tests.invalid) {
      const copy = swapCase(testCase, options);

      if (copy !== undefined) {
        yield copy;
      }
    }
  });

  return {
    ...tests,
    valid: [...tests.valid, ...validCopies],
    invalid: [...tests.invalid, ...invalidCopies],
  };
};

/**
 * `source` with each `import … from '<from>'` importing from `to`, or
 * `undefined` when one cannot be moved (see {@link withSwappedCases}).
 */
export const swapModuleImports = (
  source: string,
  {
    from,
    to,
    sharedExports,
    isTsx,
  }: ModuleParityOptions & Readonly<{ isTsx: boolean }>,
): SwapResult | undefined => {
  const shared: ReadonlySet<string> = new Set(sharedExports);

  const sourceFile = ts.createSourceFile(
    isTsx ? 'case.tsx' : 'case.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
    isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const nodes = descendantsOf(sourceFile);

  const literals = nodes.filter(
    (node): node is ts.NoSubstitutionTemplateLiteral | ts.StringLiteral =>
      (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
      node.text === from,
  );

  const shapes = literals.map((literal) =>
    ts.isStringLiteral(literal) &&
    ts.isImportDeclaration(literal.parent) &&
    literal.parent.moduleSpecifier === literal
      ? importShapeOf(literal.parent, shared)
      : 'unmovable',
  );

  if (
    shapes.some(
      (shape) =>
        shape === 'unmovable' ||
        (shape !== 'named' && !namespaceReadsOnlyShared(nodes, shape, shared)),
    )
  ) {
    return undefined;
  }

  const text = literals.reduceRight((acc, literal) => {
    const start = literal.getStart(sourceFile);

    const quote = source.at(start) ?? "'";

    return `${acc.slice(0, start)}${quote}${to}${quote}${acc.slice(literal.end)}`;
  }, source);

  return { text, count: literals.length };
};

/**
 * The exports of `from` that are declarations of `definedIn` — the names `from`
 * re-exports unchanged — as both packages resolve from `packageDir` (their
 * published types, so both must be built). A name both export but declare apart
 * is left out: the two are different things. So is a name both re-export from a
 * third package, declared in neither; none is today.
 */
export const listSharedExports = ({
  packageDir,
  from,
  definedIn,
}: Readonly<{
  packageDir: string;
  from: string;
  definedIn: string;
}>): readonly string[] => {
  const compilerOptions: ts.CompilerOptions = {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ESNext,
    noEmit: true,
    skipLibCheck: true,
  } as const;

  const host = ts.createCompilerHost(compilerOptions);

  const containingFile = path.join(packageDir, 'module-parity.mts');

  const resolve = (moduleName: string): string => {
    const resolved = ts.resolveModuleName(
      moduleName,
      containingFile,
      compilerOptions,
      host,
      undefined,
      undefined,
      // As an `import` from an ES module, which is how the rules' tests read it.
      ts.ModuleKind.ESNext,
    ).resolvedModule?.resolvedFileName;

    if (resolved === undefined) {
      throw new Error(
        `Cannot resolve the types of '${moduleName}' from ${packageDir}; build it first.`,
      );
    }

    return realpath(resolved);
  };

  const fromFile = resolve(from);

  const definedInFile = resolve(definedIn);

  const definedInDir = path.dirname(definedInFile);

  const program = ts.createProgram([fromFile, definedInFile], compilerOptions);

  const checker = program.getTypeChecker();

  const exportsOf = (file: string): ReadonlyMap<string, ts.Symbol> => {
    const sourceFile = program.getSourceFile(file);

    const moduleSymbol =
      sourceFile === undefined
        ? undefined
        : checker.getSymbolAtLocation(sourceFile);

    if (moduleSymbol === undefined) {
      throw new Error(`No module symbol for ${file}.`);
    }

    return new Map(
      checker
        .getExportsOfModule(moduleSymbol)
        .map((symbol) => [symbol.name, symbol] as const),
    );
  };

  const fromExports = exportsOf(fromFile);

  const definedInExports = exportsOf(definedInFile);

  const isDeclaredInDefinedIn = (symbol: ts.Symbol): boolean => {
    const target =
      (symbol.flags & ts.SymbolFlags.Alias) === 0
        ? symbol
        : checker.getAliasedSymbol(symbol);

    const declarations = target.declarations ?? [];

    return (
      Arr.isNonEmpty(declarations) &&
      declarations.every((declaration) =>
        realpath(declaration.getSourceFile().fileName).startsWith(
          `${definedInDir}${path.sep}`,
        ),
      )
    );
  };

  return Array.from(fromExports)
    .filter(
      ([name, symbol]) =>
        definedInExports.has(name) && isDeclaredInDefinedIn(symbol),
    )
    .map(([name]) => name)
    .toSorted();
};

/**
 * Throws, naming the difference (also on stderr), when `declared` is not the
 * {@link listSharedExports} of the packages; a package's Vitest `globalSetup`
 * calls it once per run with its own list, which its rules read.
 */
export const assertSharedExports = (
  declared: readonly string[],
  packages: Parameters<typeof listSharedExports>[0],
): void => {
  const actual = listSharedExports(packages);

  const missing = actual.filter((name) => !declared.includes(name));

  const extra = declared.filter((name) => !actual.includes(name));

  if (!Arr.isNonEmpty(missing) && !Arr.isNonEmpty(extra)) {
    return;
  }

  const message = [
    `The shared exports declared for ${packages.packageDir} are not what ${packages.from} re-exports from ${packages.definedIn}.`,
    ...(Arr.isNonEmpty(missing) ? [`  missing: ${missing.join(', ')}`] : []),
    ...(Arr.isNonEmpty(extra) ? [`  not shared: ${extra.join(', ')}`] : []),
  ].join('\n');

  // Thrown from a Vitest global setup, an error's message is lost while Vitest
  // maps its stack, and only Vitest's own crash is reported.
  console.error(message);

  throw new Error(message);
};

type SwapResult = Readonly<{
  /** The source with every import from `from` importing from `to`. */
  text: string;

  /** How many import declarations were moved. */
  count: number;
}>;

type RuleTesterClassLike = Readonly<{
  prototype: Readonly<{ run: (...args: readonly never[]) => void }>;
}>;

const installedMark = Symbol.for('eslint-rule-module-parity.installed');

const swapAll = (
  sources: readonly string[],
  swap: (source: string) => SwapResult | undefined,
): readonly string[] | undefined => {
  const swapped = sources.map((source) => swap(source)?.text);

  return swapped.includes(undefined)
    ? undefined
    : swapped.filter((text) => text !== undefined);
};

const swapCase = <C extends CaseLike>(
  testCase: C,
  options: ModuleParityOptions,
): C | undefined => {
  const isTsx = testCase.filename?.endsWith('.tsx') ?? false;

  const swap = (source: string): SwapResult | undefined =>
    swapModuleImports(source, { ...options, isTsx });

  const code = swap(testCase.code);

  if (code === undefined || code.count === 0) {
    return undefined;
  }

  const outputs =
    testCase.output === undefined || testCase.output === null
      ? testCase.output
      : typeof testCase.output === 'string'
        ? swap(testCase.output)?.text
        : swapAll(testCase.output, swap);

  if (
    outputs === undefined &&
    testCase.output !== undefined &&
    testCase.output !== null
  ) {
    return undefined;
  }

  const errors = testCase.errors?.map((error) => {
    if (error.suggestions === undefined || error.suggestions === null) {
      return error;
    }

    const suggestions = error.suggestions.map((suggestion) => {
      const output = swap(suggestion.output)?.text;

      return output === undefined ? undefined : { ...suggestion, output };
    });

    return suggestions.includes(undefined)
      ? undefined
      : { ...error, suggestions };
  });

  if (errors?.includes(undefined) === true) {
    return undefined;
  }

  return {
    ...testCase,
    name: `${testCase.name ?? testCase.code} [imported from ${options.to}]`,
    code: code.text,
    ...(testCase.output === undefined ? {} : { output: outputs }),
    ...(errors === undefined ? {} : { errors }),
  };
};

/**
 * How `declaration` imports from the module: `'named'` when by name and only
 * shared exports, the namespace's name for `import * as ns`, and `'unmovable'`
 * for anything else (side-effect, default, empty braces, an
 * export only it has).
 */
const importShapeOf = (
  declaration: ts.ImportDeclaration,
  shared: ReadonlySet<string>,
): ts.Identifier | 'named' | 'unmovable' => {
  const clause = declaration.importClause;

  const bindings = clause?.namedBindings;

  if (bindings === undefined || clause?.name !== undefined) {
    return 'unmovable';
  }

  if (ts.isNamespaceImport(bindings)) {
    return bindings.name;
  }

  return Arr.isNonEmpty(bindings.elements) &&
    bindings.elements.every((element) =>
      shared.has((element.propertyName ?? element.name).text),
    )
    ? 'named'
    : 'unmovable';
};

const isQualifierOfShared = (
  node: ts.Identifier,
  shared: ReadonlySet<string>,
): boolean => {
  const parent = node.parent;

  return ts.isPropertyAccessExpression(parent)
    ? parent.expression === node && shared.has(parent.name.text)
    : ts.isQualifiedName(parent) &&
        parent.left === node &&
        shared.has(parent.right.text);
};

/** Every other `ns` in the file is `ns.<shared>`, as a value or a type. */
const namespaceReadsOnlyShared = (
  nodes: readonly ts.Node[],
  declared: ts.Identifier,
  shared: ReadonlySet<string>,
): boolean =>
  nodes.every(
    (node) =>
      !ts.isIdentifier(node) ||
      node === declared ||
      node.text !== declared.text ||
      isQualifierOfShared(node, shared),
  );

/** `node` and every node under it, in source order. */
const descendantsOf = (node: ts.Node): readonly ts.Node[] =>
  Arr.toUnshifted(node)(node.getChildren().flatMap(descendantsOf));

// eslint-disable-next-line security/detect-non-literal-fs-filename
const realpath = (file: string): string => fs.realpathSync(file);
