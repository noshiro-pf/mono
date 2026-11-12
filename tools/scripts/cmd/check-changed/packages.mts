import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, isString, Result } from 'ts-data-forge';
import { getWorkspacePackages } from 'ts-repo-utils';
import ts from 'typescript';
import { readsForgottenExports } from '../../lib/forgotten-exports-scope.mjs';
import { packageNameOf } from '../../lib/package-name.mjs';
import { runtimeImportSpecifiers } from '../../lib/runtime-specifiers.mjs';
import { projectRootPath } from '../../project-root-path.mjs';
import { readGateList } from '../workflow-steps.mjs';
import { readManifestDependencies, type PackageInfo } from './plan.mjs';

/** The workspace members, as `plan.mts` reads them. */
export const readPackages = async (): Promise<readonly PackageInfo[]> => {
  const workspace = await getWorkspacePackages(projectRootPath);

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a config in a workspace member, or a module it imports
  const readModule = moduleReader((file) => fs.readFile(file, 'utf8'));

  const lintImports = await Promise.all(
    workspace.map(async ({ path: dir }) =>
      readLintImports(
        dir,
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a directory a workspace glob matched
        await fs.readdir(dir),
        { readModule, resolve: resolveModule },
      ),
    ),
  );

  const members: ReadonlySet<string> = new Set<string>(
    workspace.map(({ name }) => name),
  );

  return workspace.map((pkg, index) => {
    const dir = path
      .relative(projectRootPath, pkg.path)
      .split(path.sep)
      .join('/');

    return {
      name: pkg.name,
      dir,
      scripts: new Set(scriptsOf(pkg.packageJson).keys()),
      isPrivate:
        isRecord(pkg.packageJson) && pkg.packageJson['private'] === true,
      ...readManifestDependencies(pkg.packageJson, members),
      forgottenExportsRead: readsForgottenExports({
        name: pkg.name,
        dir,
        manifest: pkg.packageJson,
      }),
      lintImports: lintImports[index] ?? new Set<string>(),
    };
  });
};

/**
 * A `readModule` for {@link readLintImports}, shared across members so that a
 * module many configs import is read once: a module's runtime specifiers, or
 * `undefined` for a file gone since it was listed or resolved. Any other read
 * error is not a fact about the config, so it fails.
 */
export const moduleReader = (
  readFile: (file: string) => Promise<string>,
): ((file: string) => Promise<readonly string[] | undefined>) => {
  const mut_modules = new Map<string, Promise<readonly string[] | undefined>>();

  return (file) => {
    const cached = mut_modules.get(file);

    if (cached !== undefined) {
      return cached;
    }

    const read = readFile(file)
      .then((source) => runtimeImportSpecifiers(source, file))
      .catch((error: unknown) => {
        // A file gone since it was listed or resolved.
        if (isRecord(error) && error['code'] === 'ENOENT') {
          return undefined;
        }

        throw error;
      });

    mut_modules.set(file, read);

    return read;
  };
};

/**
 * The packages the `eslint.config*.mts` among `files` of `dir` import at run
 * time by name, as `packageNameOf` names them, through the modules of the
 * repository they import too: a relative specifier, followed where
 * `resolveModule` finds a module file for it. One it does not is left alone, a
 * known limit `resolveModule` describes.
 * `readModule` gives a module's runtime specifiers, or `undefined` where there
 * is no file to read; a caller shares one across members, so that a module many
 * configs import is read once, and each is asked for once here.
 */
export const readLintImports = async (
  dir: string,
  files: readonly string[],
  io: Readonly<{
    readModule: (file: string) => Promise<readonly string[] | undefined>;
    resolve: (specifier: string, importer: string) => string | undefined;
  }>,
): Promise<ReadonlySet<string>> => {
  const mut_names = new Set<string>();

  const mut_seen = new Set<string>();

  const visit = async (file: string): Promise<void> => {
    // One key for a file, whichever separators named it.
    const key = path.resolve(file);

    if (mut_seen.has(key)) {
      return;
    }

    mut_seen.add(key);

    // A module followed into another member's sources does not count as an
    // import of that member: a member's lint loads members by name, from
    // `dist/`, and what the plan builds and lints follows that. The one such
    // path today, `tools/configs/oxlint-rules.mts` into `eslint-config-typed`,
    // is reached from configs that import that package by name too.
    for (const specifier of (await io.readModule(key)) ?? []) {
      // A `#` import is not followed (no member declares `imports`), and
      // `packageNameOf` reads it as no package.
      if (ts.isExternalModuleNameRelative(specifier)) {
        const resolved = io.resolve(specifier, key);

        if (resolved !== undefined) {
          await visit(resolved);
        }
      } else {
        const name = packageNameOf(specifier);

        if (name !== undefined) {
          mut_names.add(name);
        }
      }
    }
  };

  for (const file of files) {
    if (isLintConfig(file)) {
      await visit(path.join(dir, file));
    }
  }

  return mut_names;
};

/**
 * The JavaScript or TypeScript module file `specifier` names from `importer`,
 * as TypeScript resolves it for a bundler (tsx, jiti): `./rules.mjs` to
 * `rules.mts` where there is one, `./view.js` to `view.tsx`, `./rules.mts` to
 * itself. A known limit: an extensionless specifier or a directory, which jiti
 * also loads as `.mts` or `index.mts`, resolves only to a `.ts`, `.tsx` or
 * `.js` file, and to none where TypeScript finds a declaration alone. A data
 * file it resolves to imports nothing at run time.
 */
export const resolveModule = (
  specifier: string,
  importer: string,
): string | undefined => {
  // Under the `import` condition, a `require(…)` too, which differs only where
  // `package.json` maps a specifier by condition.
  const resolved = ts.resolveModuleName(
    specifier,
    importer,
    RESOLUTION_OPTIONS,
    ts.sys,
    resolutionCache,
  ).resolvedModule;

  if (resolved === undefined) {
    return undefined;
  }

  if (RUNTIME_EXTENSIONS.has(resolved.extension)) {
    return resolved.resolvedFileName;
  }

  // A declaration resolved in place of the module beside it: the file the
  // specifier names, when it is there and runs.
  const named = path.resolve(path.dirname(importer), specifier);

  return RUNTIME_EXTENSIONS.has(path.extname(named)) &&
    !DECLARATION_FILE.test(named) &&
    ts.sys.fileExists(named)
    ? named
    : undefined;
};

/** A manifest's string-valued `scripts`, by name. */
export const scriptsOf = (manifest: unknown): ReadonlyMap<string, string> => {
  const scripts =
    isRecord(manifest) && isRecord(manifest['scripts'])
      ? manifest['scripts']
      : ({} as const);

  return new Map(
    Arr.generate(function* () {
      for (const [name, command] of Object.entries(scripts)) {
        if (isString(command)) {
          yield [name, command] as const;
        }
      }
    }),
  );
};

/**
 * The paths the code gate ignores, from the list `code-check.yml`'s gate reads
 * (`tools/configs/gate-ignore-lists.json`), so that what check-changed calls
 * prose is what CI skips.
 */
export const readProseGate = (): Result<readonly string[], string> => {
  const patterns = readGateList('code', projectRootPath);

  return patterns.ok ? Result.ok(patterns.value) : Result.err(patterns.message);
};

// `as const` is written by `fix:codemod`, which adds it to an object literal
// whatever its annotation.
const RESOLUTION_OPTIONS: ts.CompilerOptions = {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  allowJs: true,
} as const;

/** Shared by every member, whose configs import the same modules. */
const resolutionCache = ts.createModuleResolutionCache(
  projectRootPath,
  (fileName) => fileName,
  RESOLUTION_OPTIONS,
);

/** The extensions of a module that runs. */
const RUNTIME_EXTENSIONS: ReadonlySet<string> = new Set<string>([
  ts.Extension.Mts,
  ts.Extension.Ts,
  ts.Extension.Tsx,
  ts.Extension.Cts,
  ts.Extension.Mjs,
  ts.Extension.Js,
  ts.Extension.Jsx,
  ts.Extension.Cjs,
]);

/** A declaration file's name (`.d.ts`, `.d.mts`, `.d.cts`). */
const DECLARATION_FILE = /\.d\.[cm]?ts$/u;

/** Whether a file name is an ESLint config's (`eslint.config*.mts`). */
const isLintConfig = (file: string): boolean =>
  file.startsWith('eslint.config') && file.endsWith('.mts');
