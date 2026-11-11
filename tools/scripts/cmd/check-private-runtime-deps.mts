import * as fs from 'node:fs/promises';
import { builtinModules } from 'node:module';
import * as path from 'node:path';
import { Arr, hasKey, isRecord, Result } from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import type { JsonValue } from 'ts-type-forge';
import * as ts from 'typescript';
import { listTrackedFiles } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a module under a private package's `src/` imports, at run time, a
 * package that the package lists only in `devDependencies`.
 *
 * The convention (#3361): what `src/` needs at run time goes in `dependencies`,
 * in a private app as in a published library, though nobody installs a private
 * app from npm. Two things read the field. A Chrome extension is versioned by
 * following its `dependencies` through the lockfile
 * (`tools/scripts/lib/chrome-extensions.mts`, #2882), which leaves
 * `devDependencies` out on purpose, so a bundled import declared there would
 * not version the extension when it moves. And a reader of the manifest takes
 * the split as what the app ships against what it is built with. A peer or an
 * optional dependency also counts as declared at run time.
 *
 * `check:published-deps` answers the same question for the published packages
 * with an ESLint pass. It is not extended to the private ones: this reads
 * nothing but import declarations, with the TypeScript parser, and leaves out
 * an import of types only, so it has no rule configuration of its own to get
 * wrong. An import the manifest does not declare at all is the lint rule's
 * (`import-x/no-extraneous-dependencies`), not this check's.
 */
export const checkPrivateRuntimeDeps = async (): Promise<
  Result<number, string>
> => {
  const packages = await getWorkspacePackages(projectRootPath);

  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return tracked;
  }

  // `apps/` only: the other private members are tooling whose manifests follow
  // rules of their own (`strict-lib/` keeps every dependency in
  // `devDependencies` on purpose, `check:root:strict-lib-dev-dependencies`).
  const privatePackages = packages.filter(
    (pkg) =>
      isRecord(pkg.packageJson) &&
      pkg.packageJson['private'] === true &&
      path.relative(projectRootPath, pkg.path).startsWith(`apps${path.sep}`),
  );

  const mut_messages: string[] = [];

  for (const pkg of privatePackages) {
    const packageDir = path
      .relative(projectRootPath, pkg.path)
      .split(path.sep)
      .join('/');

    const sources = tracked.value.filter((file) =>
      isRuntimeSource(file, `${packageDir}/src/`),
    );

    const files = await Promise.all(
      sources.map(async (file) => ({
        path: file,
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a tracked file of a workspace package.
        text: await fs.readFile(path.join(projectRootPath, file), 'utf8'),
      })),
    );

    for (const { name, files: importers } of findDevOnlyRuntimeImports({
      manifest: pkg.packageJson,
      jsxImportSource: jsxImportSourceOf(pkg.path),
      files,
    })) {
      mut_messages.push(
        `${packageDir}/package.json: \`${name}\` is in devDependencies, but ${importers.join(', ')} import${Arr.isFixedLengthArray(1, importers) ? 's' : ''} it at run time. Move it to dependencies.`,
      );
    }
  }

  return Arr.isNonEmpty(mut_messages)
    ? Result.err(mut_messages.join('\n'))
    : Result.ok(privatePackages.length);
};

/**
 * The packages of `files` imports at run time that `manifest` lists in
 * `devDependencies` and in none of the runtime fields, each with the files
 * importing it. A `.tsx` / `.jsx` module also imports its JSX runtime without
 * writing it: the package a `@jsxImportSource` pragma names, or else
 * `jsxImportSource`, the package's tsconfig setting.
 */
export const findDevOnlyRuntimeImports = ({
  manifest,
  jsxImportSource,
  files,
}: Readonly<{
  manifest: JsonValue;
  jsxImportSource?: string | undefined;
  files: readonly Readonly<{ path: string; text: string }>[];
}>): readonly Readonly<{ name: string; files: readonly string[] }>[] => {
  const declared = new Set<string>(
    RUNTIME_FIELDS.flatMap((field) => namesIn(manifest, field)),
  );

  const devOnly = new Set<string>(
    namesIn(manifest, 'devDependencies').filter((name) => !declared.has(name)),
  );

  const mut_importers = new Map<string, readonly string[]>();

  for (const file of files) {
    const jsxRuntime = /\.[jt]sx$/u.test(file.path)
      ? (JSX_PRAGMA.exec(file.text)?.groups?.['source'] ?? jsxImportSource)
      : undefined;

    for (const name of new Set<string>([
      ...runtimeImportsOf(file.path, file.text),
      ...(jsxRuntime === undefined
        ? []
        : [packageNameOf(jsxRuntime) ?? jsxRuntime]),
    ])) {
      if (devOnly.has(name)) {
        mut_importers.set(
          name,
          Arr.toPushed(mut_importers.get(name) ?? [], file.path),
        );
      }
    }
  }

  return Array.from(mut_importers, ([name, importers]) => ({
    name,
    files: importers,
  }));
};

/**
 * The packages a module imports at run time, by package name, in the order
 * written: from `import` and `export … from` declarations that bring in a value
 * (or nothing, for a side effect), and from an `import()` of a string literal.
 * A relative path, a Node built-in and a specifier with a scheme
 * (`astro:content`, `virtual:…`) name no package.
 */
export const runtimeImportsOf = (
  fileName: string,
  text: string,
): readonly string[] => {
  const source = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const mut_names: string[] = [];

  const add = (specifier: ts.Node | undefined): void => {
    if (specifier === undefined || !ts.isStringLiteralLike(specifier)) {
      return;
    }

    const name = packageNameOf(specifier.text);

    if (name !== undefined) {
      mut_names.push(name);
    }
  };

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && importsAValue(node.importClause)) {
      add(node.moduleSpecifier);
    }

    if (
      ts.isExportDeclaration(node) &&
      !node.isTypeOnly &&
      !(
        node.exportClause !== undefined &&
        ts.isNamedExports(node.exportClause) &&
        Arr.isNonEmpty(node.exportClause.elements) &&
        node.exportClause.elements.every((element) => element.isTypeOnly)
      )
    ) {
      add(node.moduleSpecifier);
    }

    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      add(node.arguments[0]);
    }

    ts.forEachChild(node, visit);
  };

  visit(source);

  return mut_names;
};

/** The fields that declare what a package needs at run time. */
const RUNTIME_FIELDS = [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

const BUILTINS: ReadonlySet<string> = new Set<string>(builtinModules);

/** A `@jsxImportSource` pragma, which overrides the tsconfig for its file. */
const JSX_PRAGMA = /@jsxImportSource\s+(?<source>[^\s*]+)/u;

/**
 * A module of the package's own `src/` that runs in the app: a script or
 * component, not a declaration file, and not a test or a benchmark, which
 * Vitest runs.
 */
export const isRuntimeSource = (file: string, srcDir: string): boolean =>
  file.startsWith(srcDir) &&
  /\.(?:[cm]?[jt]s|[jt]sx)$/u.test(file) &&
  !/\.d\.(?:[cm]?ts|css\.ts)$/u.test(file) &&
  !/\.(?:test|bench)[.-]/u.test(path.posix.basename(file));

/** The `jsxImportSource` a package's `tsconfig.json` resolves to, if any. */
const jsxImportSourceOf = (packagePath: string): string | undefined => {
  const configPath = path.join(packagePath, 'tsconfig.json');

  const read = ts.readConfigFile(configPath, (file) => ts.sys.readFile(file));

  if (read.error !== undefined) {
    return undefined;
  }

  return ts.parseJsonConfigFileContent(
    read.config,
    ts.sys,
    path.dirname(configPath),
  ).options.jsxImportSource;
};

/** Whether an import declaration brings in a value, or runs for its effect. */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- DeepReadonly does not satisfy it for this node type; read only.
const importsAValue = (clause: ts.ImportClause | undefined): boolean => {
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

/**
 * The package a bare specifier names (`@scope/name` or `name`, without a
 * subpath or query), or `undefined` for anything else.
 */
const packageNameOf = (specifier: string): string | undefined => {
  if (
    specifier.startsWith('.') ||
    specifier.startsWith('/') ||
    specifier.startsWith('#') ||
    specifier.includes(':')
  ) {
    return undefined;
  }

  const [first = '', second] = specifier.split('?', 1)[0]?.split('/') ?? [];

  const name =
    second !== undefined && first.startsWith('@')
      ? (`${first}/${second}` as const)
      : first;

  return name === '' || BUILTINS.has(name) ? undefined : name;
};

/** The package names a manifest field lists. */
const namesIn = (manifest: JsonValue, field: string): readonly string[] => {
  if (!isRecord(manifest) || !hasKey(manifest, field)) {
    return [];
  }

  const value = manifest[field];

  return isRecord(value) ? Object.keys(value) : [];
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkPrivateRuntimeDeps();

  if (Result.isErr(result)) {
    console.error(
      `❌ A private package imports at run time what it lists only in devDependencies:\n\n${result.value}`,
    );

    process.exit(1);
  }

  console.info(
    `✓ The ${result.value} private packages declare what their src/ imports at run time in dependencies (or as a peer).`,
  );
}
