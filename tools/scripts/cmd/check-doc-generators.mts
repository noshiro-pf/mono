import * as fsSync from 'node:fs';
import * as path from 'node:path';
import { Arr, unknownToString } from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';
import { matchScriptNames, readScripts } from '../lib/manifest-scripts.mjs';
import { readPnpmRun, readRunAll } from '../lib/pnpm-command.mjs';
import { readShellCommands } from '../lib/shell-commands.mjs';
import { pathFromRoot, projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a package's `doc` writes a committed file through a generator its
 * `gen` does not run.
 *
 * `check-changed` runs a touched package's `gen`, and CI's `ws:gen` job is what
 * notices a stale committed file by name. `doc` writes untracked output
 * (CLAUDE.md, "Commands"), so a generator of a committed file that only `doc`
 * runs goes stale with nothing local saying so, and the first failure is a
 * dirty tree after `ws:doc` in `style-check.yml` (#2810: ts-type-forge's
 * README type listing, whose line links moved when a comment did).
 *
 * Two questions, about the scripts `doc` reaches and `gen` does not:
 *
 * - **A `gen:` script among them** is a generator by its name and fails as it
 *   is.
 * - **A file one of them runs** (`tsx` or `node`) may import only what a `gen`
 *   script runs as its entry point (the embedding steps most `gen-docs.mts`
 *   repeat), `src/` or a `*-root-path` module, and may not call a `node:fs`
 *   writer itself. Its syntax is read one file deep, so a write through a child
 *   process (TypeDoc, run as a command, writes the untracked `docs/`), through
 *   a package import, or inside a module it may import (`src/` included) is not
 *   seen; CI's dirty-tree check after `ws:doc` stays the backstop for those.
 */
export const findDocOnlyGenerators = ({
  packageDir,
  scripts,
  readSource,
}: Readonly<{
  /** Repository-relative, for the messages. */
  packageDir: string;
  scripts: ReadonlyRecord<string, string>;
  /**
   * A package-relative file's text (a path may lead out of the package with
   * `../`), `undefined` when it does not exist.
   */
  readSource: (file: string) => string | undefined;
}>): readonly string[] => {
  if (scripts['doc'] === undefined) {
    return [];
  }

  const names = Object.keys(scripts);

  const reach = (from: readonly string[]): ReadonlySet<string> => {
    const mut_seen = new Set<string>();

    const mut_queue = Array.from(from);

    while (Arr.isNonEmpty(mut_queue)) {
      const current = mut_queue.shift();

      if (current === undefined || mut_seen.has(current)) {
        continue;
      }

      mut_seen.add(current);

      mut_queue.push(
        ...parseScriptInvocations(scripts[current] ?? '').flatMap((pattern) =>
          matchScriptNames(pattern, names),
        ),
      );
    }

    return mut_seen;
  };

  const generators =
    scripts['gen'] === undefined ? new Set<string>() : reach(['gen']);

  const generatorEntries: ReadonlySet<string> = new Set<string>(
    Array.from(generators).flatMap((name) =>
      parseScriptEntries(scripts[name] ?? ''),
    ),
  );

  const docOnly = Array.from(reach(['doc'])).filter(
    (name) => !generators.has(name),
  );

  const namedGenerators = docOnly
    .filter((name) => name.startsWith('gen:'))
    .map(
      (name) =>
        `${packageDir}: \`doc\` runs \`${name}\`, which \`gen\` does not.`,
    );

  const docOnlyEntries = Arr.uniq(
    docOnly
      .filter((name) => !name.startsWith('gen:'))
      .flatMap((name) => parseScriptEntries(scripts[name] ?? ''))
      .filter((entry) => !generatorEntries.has(entry)),
  );

  const fromFiles = docOnlyEntries.flatMap((entry) => {
    const source = readSource(entry);

    if (source === undefined) {
      return [];
    }

    const parsed = readModule(source);

    const notRunByGen = parsed.relativeImports
      .map((specifier) => resolveImport(entry, specifier))
      .filter(
        (file) =>
          !file.startsWith('src/') &&
          !ROOT_PATH_MODULE.test(file) &&
          !generatorEntries.has(file),
      );

    return [
      ...(parsed.writesFiles
        ? [
            `${path.posix.join(packageDir, entry)} writes a file, and \`doc\` runs it where \`gen\` does not.`,
          ]
        : []),
      ...notRunByGen.map(
        (file) =>
          `${path.posix.join(packageDir, entry)} imports ${path.posix.join(packageDir, file)}, which no \`gen\` script runs.`,
      ),
    ];
  });

  return [...namedGenerators, ...fromFiles];
};

/**
 * The scripts a body runs, as the patterns `matchScriptNames` reads: the name
 * after each `pnpm run` and its options, whatever arguments follow it (a script
 * run with arguments still runs), and every name of a `run-s` / `run-p` list. A
 * run that an option points at other packages or the root (`--recursive`,
 * `--filter`, `-C`, `-w`) runs none of this package's scripts, so it is left
 * out.
 */
export const parseScriptInvocations = (body: string): readonly string[] =>
  readShellCommands(body).commands.flatMap((words) => {
    const run = readPnpmRun(words);

    if (run !== undefined) {
      return run.recursive ||
        run.workspaceRoot ||
        run.directory !== undefined ||
        Arr.isNonEmpty(run.filters)
        ? []
        : [run.script];
    }

    const list = readRunAll(words);

    return list === undefined ? [] : [...list.scripts, ...list.withArguments];
  });

/**
 * The files a script body runs with `tsx` or `node`, package-relative and
 * `/`-separated: the first script-file argument after each, past its options.
 */
export const parseScriptEntries = (body: string): readonly string[] =>
  Arr.generate(function* () {
    for (const words of readShellCommands(body).commands) {
      const runner = words.findIndex((word) => SCRIPT_RUNNERS.has(word));

      const file =
        runner === -1
          ? undefined
          : words.slice(runner + 1).find((word) => SCRIPT_FILE.test(word));

      if (file !== undefined) {
        yield path.posix.normalize(file);
      }
    }
  });

/**
 * What a module's syntax says about it, read with TypeScript's parser so that
 * comments and strings are never taken for code:
 *
 * - `relativeImports`: the relative specifiers it loads values from — static
 *   imports (bare ones too), re-exports and dynamic `import()`, an import or
 *   re-export whose bindings are all `type` left out;
 * - `writesFiles`: whether it calls one of {@link FILE_WRITERS} of `node:fs`:
 *   through the module's namespace or default binding (`fs.writeFile(…)`,
 *   `fs.promises.writeFile(…)`), or by a name imported or destructured from
 *   it, renamed or not.
 */
export const readModule = (
  source: string,
): Readonly<{ relativeImports: readonly string[]; writesFiles: boolean }> => {
  const file = ts.createSourceFile(
    'module.mts',
    source,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ false,
    ts.ScriptKind.TS,
  );

  const mut_imports: string[] = [];

  /** Local names bound to the `node:fs` module itself. */
  const mut_fsBindings = new Set<string>();

  /** Local names bound to one of its writers. */
  const mut_writerAliases = new Set<string>();

  const mut_state = { writes: false };

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      const specifier = relativeSpecifier(node.moduleSpecifier);

      if (specifier !== undefined && importsValues(node)) {
        mut_imports.push(specifier);
      }

      if (isFsSpecifier(node.moduleSpecifier)) {
        const clause = node.importClause;

        const bindings = clause?.namedBindings;

        if (clause?.name !== undefined) {
          mut_fsBindings.add(clause.name.text);
        }

        if (bindings !== undefined && ts.isNamespaceImport(bindings)) {
          mut_fsBindings.add(bindings.name.text);
        }

        if (bindings !== undefined && ts.isNamedImports(bindings)) {
          for (const element of bindings.elements) {
            if (FILE_WRITERS.has((element.propertyName ?? element.name).text)) {
              mut_writerAliases.add(element.name.text);
            }
          }
        }
      }
    }

    // `const { writeFile } = fs` or `= await import('node:fs/promises')`.
    if (
      ts.isVariableDeclaration(node) &&
      ts.isObjectBindingPattern(node.name) &&
      node.initializer !== undefined &&
      isFsValue(node.initializer, mut_fsBindings)
    ) {
      for (const element of node.name.elements) {
        const imported = element.propertyName ?? element.name;

        if (
          ts.isIdentifier(imported) &&
          ts.isIdentifier(element.name) &&
          FILE_WRITERS.has(imported.text)
        ) {
          mut_writerAliases.add(element.name.text);
        }
      }
    }

    if (ts.isExportDeclaration(node) && !node.isTypeOnly) {
      const specifier = relativeSpecifier(node.moduleSpecifier);

      const allTypes =
        node.exportClause !== undefined &&
        ts.isNamedExports(node.exportClause) &&
        Arr.isNonEmpty(node.exportClause.elements) &&
        node.exportClause.elements.every((element) => element.isTypeOnly);

      if (specifier !== undefined && !allTypes) {
        mut_imports.push(specifier);
      }
    }

    if (ts.isCallExpression(node)) {
      const callee = node.expression;

      if (callee.kind === ts.SyntaxKind.ImportKeyword) {
        const specifier = relativeSpecifier(node.arguments[0]);

        if (specifier !== undefined) {
          mut_imports.push(specifier);
        }
      }

      if (
        (ts.isPropertyAccessExpression(callee) &&
          FILE_WRITERS.has(callee.name.text) &&
          mut_fsBindings.has(rootName(callee))) ||
        (ts.isIdentifier(callee) && mut_writerAliases.has(callee.text))
      ) {
        mut_state.writes = true;
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(file);

  return { relativeImports: mut_imports, writesFiles: mut_state.writes };
};

/** The programs whose first script-file argument is the file a body runs. */
const SCRIPT_RUNNERS: ReadonlySet<string> = new Set<string>(['tsx', 'node']);

const SCRIPT_FILE = /\.[cm]?[jt]s$/u;

const MJS_EXTENSION = /\.mjs$/u;

const ROOT_PATH_MODULE = /(?:^|\/)[\w-]+-root-path\.mts$/u;

const RELATIVE = /^\.{1,2}\//u;

const FS_MODULES: ReadonlySet<string> = new Set<string>([
  'fs',
  'fs/promises',
  'node:fs',
  'node:fs/promises',
]);

/**
 * The `node:fs` functions that change a file's content or existence, callback,
 * promise and synchronous forms alike.
 */
const FILE_WRITERS: ReadonlySet<string> = new Set<string>([
  'appendFile',
  'appendFileSync',
  'copyFile',
  'copyFileSync',
  'cp',
  'cpSync',
  'createWriteStream',
  'rename',
  'renameSync',
  'rm',
  'rmSync',
  'truncate',
  'truncateSync',
  'unlink',
  'unlinkSync',
  'write',
  'writeFile',
  'writeFileSync',
  'writeSync',
]);

/** A relative specifier as the package-relative `.mts` file it names. */
const resolveImport = (from: string, specifier: string): string =>
  path.posix
    .join(path.posix.dirname(from), specifier)
    .replace(MJS_EXTENSION, '.mts');

/** The text of a relative module specifier, a template with no `${}` too. */
const relativeSpecifier = (
  specifier: DeepReadonly<ts.Node> | undefined,
): string | undefined =>
  specifier !== undefined &&
  (ts.isStringLiteral(specifier) ||
    ts.isNoSubstitutionTemplateLiteral(specifier)) &&
  RELATIVE.test(specifier.text)
    ? specifier.text
    : undefined;

const isFsSpecifier = (specifier: DeepReadonly<ts.Node>): boolean =>
  ts.isStringLiteral(specifier) && FS_MODULES.has(specifier.text);

/** The identifier a property access chain starts from (`fs` of `fs.a.b`). */
const rootName = (expression: DeepReadonly<ts.Expression>): string =>
  ts.isPropertyAccessExpression(expression)
    ? rootName(expression.expression)
    : ts.isIdentifier(expression)
      ? expression.text
      : '';

/** `fs`, `fs.promises`, or `await import('node:fs/promises')`. */
const isFsValue = (
  expression: DeepReadonly<ts.Expression>,
  fsBindings: ReadonlySet<string>,
): boolean => {
  if (
    ts.isIdentifier(expression) ||
    ts.isPropertyAccessExpression(expression)
  ) {
    return fsBindings.has(rootName(expression));
  }

  const awaited = ts.isAwaitExpression(expression)
    ? expression.expression
    : expression;

  return (
    ts.isCallExpression(awaited) &&
    awaited.expression.kind === ts.SyntaxKind.ImportKeyword &&
    awaited.arguments[0] !== undefined &&
    isFsSpecifier(awaited.arguments[0])
  );
};

/**
 * Whether an import declaration loads a value: not `import type`, and not one
 * whose every named binding is `type` with no default or namespace binding.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- DeepReadonly does not satisfy it for this node type; read only.
const importsValues = (node: DeepReadonly<ts.ImportDeclaration>): boolean => {
  const clause = node.importClause;

  if (clause === undefined) {
    return true;
  }

  if (clause.phaseModifier === ts.SyntaxKind.TypeKeyword) {
    return false;
  }

  const bindings = clause.namedBindings;

  return (
    clause.name !== undefined ||
    bindings === undefined ||
    !ts.isNamedImports(bindings) ||
    !Arr.isNonEmpty(bindings.elements) ||
    bindings.elements.some((element) => !element.isTypeOnly)
  );
};

const main = async (): Promise<number> => {
  const packages = await getWorkspacePackages(projectRootPath);

  const violations = packages.flatMap((pkg) =>
    findDocOnlyGenerators({
      packageDir: pathFromRoot(pkg.path),
      scripts: readScripts(pkg.packageJson),
      readSource: (file) => {
        try {
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file a workspace script runs.
          return fsSync.readFileSync(path.join(pkg.path, file), 'utf8');
        } catch {
          return undefined;
        }
      },
    }),
  );

  if (Arr.isNonEmpty(violations)) {
    console.error(
      [
        '❌ A `doc` script writes what no `gen` script does:',
        '',
        ...violations.map((violation) => `  - ${violation}`),
        '',
        "A committed file is written by a `gen:` script that the package's `gen`",
        'names, because `check-changed` and the `ws:gen` job run `gen` and not',
        '`doc`. Move the generator into a `gen:` script and add it to `gen`.',
      ].join('\n'),
    );

    return 1;
  }

  console.info(
    `Every package's \`doc\` writes committed files only through \`gen\` (${packages.length} packages read).`,
  );

  return 0;
};

if (isDirectlyExecuted(import.meta.url)) {
  const exitCode = await main().catch((error: unknown) => {
    console.error(unknownToString(error));

    return 2;
  });

  process.exit(exitCode);
}
